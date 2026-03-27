import { useState, useMemo, useCallback, useEffect } from 'react';
import WhiteboardCanvas from '@/components/Whiteboard/WhiteboardCanvas';
import { PenTool, Save, Trash2 } from 'lucide-react';
import { useWhiteboard } from '@/hooks/useWhiteboard';
import ProjectFooter from '@/components/ProjectFooter';

const WhiteboardPage = () => {
  const { whiteboard, isLoading, saveWhiteboard } = useWhiteboard();
  const [elements, setElements] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load from database hook on value change
  useEffect(() => {
    if (whiteboard) {
      setElements(whiteboard.elements || []);
      if (whiteboard.updated_at) {
        setLastSaved(new Date(whiteboard.updated_at).toLocaleTimeString());
      }
    } else {
        // Fallback to local storage if no whiteboard found in database
        const localData = localStorage.getItem('local_whiteboard_data');
        if (localData) {
          setElements(JSON.parse(localData));
        }
    }
  }, [whiteboard]);

  const initialData = useMemo(() => {
    return { elements };
  }, [isLoading]);

  const handleSave = async () => {
    try {
      const payload: any = { elements };
      if (whiteboard?.id) payload.id = whiteboard.id;
      
      const savedData = await saveWhiteboard(payload);
      
      if (savedData && savedData.id) {
        setLastSaved(new Date().toLocaleTimeString());
        localStorage.setItem('local_whiteboard_data', JSON.stringify(elements));
      }
    } catch (e) {
      console.error("Failed to save whiteboard to database:", e);
      alert("Failed to save to database. Saving to local storage instead.");
      localStorage.setItem('local_whiteboard_data', JSON.stringify(elements));
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the entire whiteboard? This cannot be undone.")) {
      setElements([]);
      localStorage.removeItem('local_whiteboard_data');
    }
  };

  const handleChange = useCallback((newElements: readonly any[]) => {
    setElements(newElements as any[]);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-background text-black dark:text-white transition-colors duration-300 overflow-y-auto font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:py-12">
        
        {/* Header Section */}
        <div className="mb-8 flex items-end justify-between border-b border-black dark:border-white pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black dark:bg-white text-white dark:text-black">
              <PenTool size={24} />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tighter mb-1 uppercase">Whiteboard</h1>
                {lastSaved ? (
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    Vault Synchronized: {lastSaved}
                  </p>
                ) : (
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-[0.2em] opacity-80">Design your architecture.</p>
                )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
             <button 
                onClick={handleClear}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-2"
              >
                <Trash2 size={14} /> 
                Clear
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all flex items-center gap-2"
              >
                <Save size={14} /> 
                Save Drawing
              </button>
          </div>

          <div className="text-right flex flex-col items-end gap-1">
             <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Universal Time</div>
             <div className="text-sm font-black uppercase tracking-[0.2em] text-black dark:text-white tabular-nums">
                {new Date().toISOString().split('T')[0].split('-').join(' / ')}
             </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2 mb-8">
             <button 
                onClick={handleClear}
                className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> 
                Clear
              </button>
              <button 
                onClick={handleSave}
                className="flex-3 px-6 py-3 text-[10px] font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Save size={14} /> 
                Save
              </button>
        </div>

        <div className="border-2 border-black dark:border-white h-[70vh] min-h-[500px] mb-20 bg-white">
          <WhiteboardCanvas 
            className="h-full" 
            onChange={handleChange}
            initialData={initialData}
          />
        </div>
      </div>
      <ProjectFooter />
    </div>
  );
};


export default WhiteboardPage;
