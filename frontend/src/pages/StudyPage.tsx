import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Square, RotateCcw, BookOpen, Clock, Target, Plus, Zap, TrendingUp, TrendingDown, Flame, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectFooter from '@/components/ProjectFooter';
import { useStudy } from '@/hooks/useStudy';

export default function StudyPage() {
  const { 
    subjects, 
    sessions, 
    isLoading, 
    addSubject, 
    incrementTime, 
    deleteSubject, 
    logSession 
  } = useStudy();

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState(0); // 0 means count up (stopwatch)
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  const activeSubject = subjects?.find(s => s.id === activeSubjectId);

  const elapsedThisSession = isRunning 
    ? (targetSeconds > 0 ? Math.max(0, targetSeconds - timerSeconds) : timerSeconds)
    : 0;
  
  const accumulatedFocusTime = (subjects?.reduce((acc, s) => acc + s.time_spent_today, 0) || 0) + elapsedThisSession;

  // --- Stats Calculation ---
  const { maxStudy, minStudy, currentStreak, maxStreak, todayProgress, isTodaySecured } = useMemo(() => {
    // Helper: Consistent local date string (YYYY-MM-DD)
    const getLocalDateKey = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalDateKey(new Date());
    const dailyTotals: Record<string, number> = {};
    
    // 1. Seed today with real-time data
    dailyTotals[todayStr] = accumulatedFocusTime;

    // 2. Aggregate historical sessions using local dates
    sessions?.forEach(session => {
      try {
        const sessionDate = new Date(session.timestamp);
        const dateKey = getLocalDateKey(sessionDate);
        if (dateKey !== todayStr) {
          dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + session.duration;
        }
      } catch (e) {
        console.error("Invalid session timestamp:", session.timestamp);
      }
    });

    const STREAK_THRESHOLD = 120; // 2 minutes (120s)
    
    // Performance stats
    const durations = Object.values(dailyTotals);
    const maxProgressToday = Math.min(100, (accumulatedFocusTime / STREAK_THRESHOLD) * 100);
    const isTodaySecured = accumulatedFocusTime >= STREAK_THRESHOLD;

    // 3. Calculate Maximum (Best) Streak ever achieved in history
    let calculatedMaxStreak = 0;
    const sortedDates = Object.keys(dailyTotals).sort();
    
    if (sortedDates.length > 0) {
      let tempStreak = 0;
      let lastDate: Date | null = null;
      
      sortedDates.forEach((dateKey) => {
        if ((dailyTotals[dateKey] || 0) >= STREAK_THRESHOLD) {
          const currentDate = new Date(dateKey + 'T00:00:00');
          if (lastDate) {
            const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              tempStreak++;
            } else {
              tempStreak = 1;
            }
          } else {
            tempStreak = 1;
          }
          lastDate = currentDate;
          calculatedMaxStreak = Math.max(calculatedMaxStreak, tempStreak);
        }
      });
    }

    // 4. Persistence Safety (The Best Streak Record)
    let storedBest = 0;
    try {
      storedBest = parseInt(localStorage.getItem('motion_best_streak_v2') || '0');
    } catch (e) {}
    const finalBestStreak = Math.max(calculatedMaxStreak, storedBest);

    // 5. Calculate Current Active Streak
    let currentStreak = 0;
    let checkDate = new Date();
    let isFirstDay = true;
    
    while (currentStreak < 10000) {
      const dateKey = getLocalDateKey(checkDate);
      const dayTotal = dailyTotals[dateKey] || 0;
      
      if (dayTotal >= STREAK_THRESHOLD) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        isFirstDay = false;
      } else {
        // If it's today and we haven't hit the threshold yet, streak is still "alive" from yesterday
        if (isFirstDay && dateKey === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          isFirstDay = false;
          continue;
        }
        break;
      }
    }

    return { 
      maxStudy: durations.length > 0 ? Math.max(...durations) : 0, 
      minStudy: durations.filter(d => d >= STREAK_THRESHOLD).length > 0 ? Math.min(...durations.filter(d => d >= STREAK_THRESHOLD)) : 0, 
      currentStreak, 
      maxStreak: finalBestStreak,
      todayProgress: maxProgressToday,
      isTodaySecured
    };
  }, [sessions, subjects, accumulatedFocusTime]);

  // Persistent storage lock for the Record
  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem('motion_best_streak_v2') || '0');
      if (maxStreak > stored) {
        localStorage.setItem('motion_best_streak_v2', maxStreak.toString());
      }
    } catch (e) {}
  }, [maxStreak]);

  const dailyRegistry = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const historyWindow = new Date(today);
    historyWindow.setDate(today.getDate() - 7); 

    return sessions?.filter(session => {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate >= historyWindow;
    }) || [];
  }, [sessions]);

  // Timer Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (targetSeconds > 0 && prev <= 1) {
            setIsRunning(false);
            if (activeSubjectId && activeSubject) {
              incrementTime({ id: activeSubjectId, duration: targetSeconds });
              logSession({ subjectName: activeSubject.name, duration: targetSeconds });
            }
            alert('Study session complete!');
            setTargetSeconds(0);
            return 0;
          }
          return targetSeconds > 0 ? prev - 1 : prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, targetSeconds, activeSubjectId, activeSubject, incrementTime, logSession]);

  const handleStart = () => {
    if (!activeSubjectId) {
      alert('Please select a subject first.');
      return;
    }
    setIsRunning(true);
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (activeSubjectId && activeSubject) {
      const elapsed = (targetSeconds > 0 ? (targetSeconds - timerSeconds) : timerSeconds);
      if (elapsed > 0) {
        await incrementTime({ id: activeSubjectId, duration: elapsed });
        await logSession({ subjectName: activeSubject.name, duration: elapsed });
      }
    }
    setTimerSeconds(0);
    setTargetSeconds(0);
  };

  const setSessionDuration = (mins: number) => {
    const secs = mins * 60;
    setTargetSeconds(secs);
    setTimerSeconds(secs);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimerSeconds(targetSeconds > 0 ? targetSeconds : 0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const handleAddSubject = async (e: any) => {
    e.preventDefault();
    if (newSubjectName.trim()) {
      await addSubject(newSubjectName.trim());
      setNewSubjectName('');
      setIsAddingSubject(false);
    }
  };

  const handleDeleteSubject = async (id: string, e: any) => {
    e.stopPropagation();
    if (window.confirm('Remove this subject?')) {
      await deleteSubject(id);
      if (activeSubjectId === id) setActiveSubjectId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-black font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent animate-spin" />
          <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Synchronizing Vault...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-background text-black dark:text-white transition-colors duration-300 overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="mb-8 flex items-end justify-between border-b border-black dark:border-white pb-6">
          <div>
            <h1 className="text-xl font-black tracking-tighter mb-1 uppercase">Study Mode</h1>
            <p className="text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Focus is the key to success.</p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
             <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Universal Time</div>
             <div className="text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white tabular-nums">
                {new Date().toISOString().split('T')[0].split('-').join(' / ')}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Hero Timer Section */}
          <div className="lg:col-span-7 border border-black dark:border-white bg-transparent p-6 lg:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  isRunning ? "bg-black dark:bg-white animate-pulse" : "bg-transparent border border-gray-300 dark:border-white/20"
                )} />
                <span className="text-[9px] font-black uppercase tracking-widest text-black dark:text-white leading-none">
                  {isRunning ? (targetSeconds > 0 ? "Countdown Active" : "Session Active") : "Standby"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!isRunning && (
                  <div className="flex gap-1.5">
                    {[15, 25, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setSessionDuration(mins)}
                        className={cn(
                          "text-[9px] font-black px-2 py-0.5 border-b-2 transition-all uppercase tracking-tighter leading-none h-6",
                          targetSeconds === mins * 60 
                            ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" 
                            : "text-gray-400 border-transparent hover:text-black dark:hover:text-white"
                        )}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                )}
                {activeSubjectId && (
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white px-2 py-0.5 border border-black dark:border-white">
                    {subjects.find(s => s.id === activeSubjectId)?.name}
                  </div>
                )}
              </div>
            </div>

            <div className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-8 tabular-nums text-center lg:text-left">
              {formatTime(timerSeconds)}
            </div>

            <div className="flex items-center gap-px">
              {!isRunning ? (
                <button 
                  onClick={handleStart}
                  className="flex-1 lg:flex-none px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all flex items-center justify-center gap-3 group"
                >
                  <Play size={16} fill="currentColor" />
                  Start Focus
                </button>
              ) : (
                <button 
                  onClick={handleStop}
                  className="flex-1 lg:flex-none px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all flex items-center justify-center gap-3 group"
                >
                  <Square size={14} fill="currentColor" />
                  End Session
                </button>
              )}
              <button 
                onClick={handleReset}
                className="py-5 px-6 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center h-full"
                title="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Stats & Subjects Section */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Total Stats Card */}
            <div className="p-4 border border-black dark:border-white bg-transparent relative overflow-hidden">
              {/* Progress Background */}
              <div 
                className="absolute left-0 bottom-0 top-0 bg-primary/5 transition-all duration-1000 ease-out" 
                style={{ width: `${todayProgress}%` }}
              />
              
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2 text-black dark:text-white opacity-60">
                    <Clock size={12} />
                    <span className="text-[9px] font-black uppercase tracking-[0.25em]">Study Ledger</span>
                </div>
                <div className="flex items-center gap-4 text-black dark:text-white font-black italic text-[9px] uppercase">
                    <div className="flex items-center gap-1">
                        <TrendingUp size={10} className="opacity-40" />
                        <span className="opacity-40">Best: {maxStreak}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Flame size={10} className={cn(isTodaySecured ? "text-primary" : "opacity-30")} fill="currentColor" />
                        <span className={cn(isTodaySecured ? "text-primary" : "opacity-60")}>
                          {isTodaySecured ? " Secured" : ` Streak: ${currentStreak}`}
                        </span>
                    </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between relative z-10">
                <div className="text-2xl font-black tracking-tighter tabular-nums text-black dark:text-white">
                   {formatTime(accumulatedFocusTime)}
                </div>
                {!isTodaySecured && (
                  <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">
                    {Math.max(0, 120 - accumulatedFocusTime)}s to Streak
                  </div>
                )}
              </div>
              
              {/* Progress Line */}
              <div className="mt-4 h-1 bg-gray-100 dark:bg-white/5 relative">
                <div 
                  className={cn("h-full transition-all duration-1000 ease-out", isTodaySecured ? "bg-primary" : "bg-black dark:bg-white")} 
                  style={{ width: `${todayProgress}%` }}
                />
              </div>
            </div>

            {/* Subject Tracker List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-black dark:text-white opacity-60">
                  <Target size={12} />
                  <span className="text-[9px] font-black uppercase tracking-[0.25em]">Focus</span>
                </div>
                <button 
                  onClick={() => setIsAddingSubject(!isAddingSubject)}
                  className="text-black dark:text-white hover:opacity-50 transition-opacity"
                >
                  <Plus size={18} />
                </button>
              </div>

              {isAddingSubject && (
                <form onSubmit={handleAddSubject} className="flex gap-2 mb-2 p-1">
                  <input
                    autoFocus
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="New pillar..."
                    className="flex-1 bg-transparent border-b-2 border-black dark:border-white outline-none px-2 py-1.5 text-xs font-black uppercase tracking-widest placeholder:text-gray-300 transition-all"
                  />
                  <button 
                    type="submit"
                    className="bg-black dark:bg-white text-white dark:text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all"
                  >
                    Set
                  </button>
                </form>
              )}

              <div className="space-y-2">
                {subjects?.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setActiveSubjectId(subject.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-5 border transition-all text-left group",
                      activeSubjectId === subject.id 
                        ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black" 
                        : "border-gray-100 dark:border-white/5 bg-transparent hover:border-black dark:hover:border-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 border flex items-center justify-center transition-colors",
                        activeSubjectId === subject.id ? "bg-white dark:bg-black text-black dark:text-white border-transparent" : "bg-transparent border-gray-100 dark:border-white/10 text-gray-400 group-hover:border-black dark:group-hover:border-white"
                      )}>
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <div className="font-black text-[11px] uppercase tracking-tight">{subject.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-black tabular-nums text-xs">
                        {formatTime(subject.time_spent_today + (activeSubjectId === subject.id && isRunning ? (targetSeconds > 0 ? (targetSeconds - timerSeconds) : timerSeconds) : 0))}
                      </div>
                      <span 
                        onClick={(e) => handleDeleteSubject(subject.id, e)}
                        className={cn(
                          "p-2 border transition-all opacity-0 group-hover:opacity-100",
                          activeSubjectId === subject.id
                            ? "border-white/20 hover:bg-white hover:text-black"
                            : "border-black/10 hover:bg-black hover:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
                        )}
                      >
                        <Trash2 size={12} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Global Performance Section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-3 gap-px bg-black dark:bg-white border border-black dark:border-white">
            <div className="p-5 bg-white dark:bg-background">
                <div className="flex items-center gap-2 text-black dark:text-white mb-2 opacity-60">
                    <TrendingUp size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.25em]">Peak Output</span>
                </div>
                <div className="text-2xl font-black tracking-tighter tabular-nums text-black dark:text-white">
                    {formatTime(maxStudy)}
                </div>
                <div className="mt-2 text-[8px] text-gray-400 uppercase font-black">All-Time High</div>
            </div>
            
            <div className="p-5 bg-white dark:bg-background">
                <div className="flex items-center gap-2 text-black dark:text-white mb-2 opacity-60">
                    <TrendingDown size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.25em]">Floor Base</span>
                </div>
                <div className="text-2xl font-black tracking-tighter tabular-nums text-black dark:text-white">
                    {formatTime(minStudy)}
                </div>
                <div className="mt-2 text-[8px] text-gray-400 uppercase font-black">Minimum Commitment</div>
            </div>

            <div className="col-span-2 lg:col-span-1 p-6 bg-black dark:bg-white text-white dark:text-black flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Zap size={14} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Momentum</span>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Best: {maxStreak}</div>
                </div>
                <div className="text-3xl font-black italic tracking-tighter tabular-nums leading-none">
                    {currentStreak} <span className="text-[10px] uppercase not-italic tracking-widest opacity-60">Cycle</span>
                </div>
            </div>
        </div>

        {/* Session Ledger Section */}
        <div className="mt-20 pt-16 border-t border-black dark:border-white">
          <div className="flex items-center gap-3 text-black dark:text-white mb-10">
            <Clock size={18} />
            <span className="text-[12px] font-black uppercase tracking-[0.4em]">Session Ledger</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!dailyRegistry || dailyRegistry.length === 0 ? (
              <div className="col-span-2 py-16 text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.3em]">Vault Empty for the last 7 days.</p>
              </div>
            ) : (
              dailyRegistry.map((session) => {
                const sessionDate = new Date(session.timestamp).toLocaleDateString();
                const todayStr = new Date().toLocaleDateString();
                const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString();
                
                let dateLabel = sessionDate;
                if (sessionDate === todayStr) dateLabel = 'Today';
                else if (sessionDate === yesterdayStr) dateLabel = 'Yesterday';

                return (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-6 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center transition-colors group-hover:border-white dark:group-hover:border-black">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-tight">{session.subject_name}</div>
                        <div className="text-[9px] opacity-60 font-medium uppercase tracking-widest mt-1">
                          {dateLabel} — {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-black tabular-nums">
                      +{formatTime(session.duration)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
      <ProjectFooter />
    </div>
  );
}
