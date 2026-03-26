import { useState, useMemo, useCallback, useEffect } from 'react';
import WhiteboardCanvas from '@/components/Whiteboard/WhiteboardCanvas';
import { PenTool, Save, Trash2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';

const WhiteboardPage = () => {
  const [elements, setElements] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from database on mount
  useEffect(() => {
    const fetchWhiteboard = async () => {
      try {
        const data = await apiGet('/api/whiteboards');
        if (data && data.length > 0) {
          const latest = data[0];
          setWhiteboardId(latest.id);
          setElements(latest.elements || []);
          if (latest.updated_at) {
            setLastSaved(new Date(latest.updated_at).toLocaleTimeString());
          }
        }
      } catch (e) {
        console.error("Failed to load whiteboard from database:", e);
        const localData = localStorage.getItem('local_whiteboard_data');
        if (localData) {
          setElements(JSON.parse(localData));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhiteboard();
  }, []);

  const initialData = useMemo(() => {
    return { elements };
  }, [isLoading]);

  const handleSave = async () => {
    try {
      const payload: any = { elements };
      if (whiteboardId) payload.id = whiteboardId;
      
      const savedData = await apiPost('/api/whiteboards/save', payload);
      
      if (savedData && savedData.id) {
        setWhiteboardId(savedData.id);
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
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500 overflow-hidden">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 border-b border-border bg-card shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-primary-foreground rounded-none shadow-[2px_2px_0px_#000000]">
            <PenTool size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Whiteboard</h1>
            {lastSaved && (
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Synced: {lastSaved}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={handleClear}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium border border-border hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            <Trash2 size={16} /> 
            <span className="inline sm:hidden md:inline">Clear</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground border border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <Save size={16} /> 
            <span className="inline sm:hidden md:inline whitespace-nowrap">Save Drawing</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-2 sm:p-6 overflow-hidden">
        <div className="h-full bg-background border border-border shadow-sm sm:shadow-[8px_8px_0px_rgba(0,0,0,0.05)] translate-y-0 translate-x-0 sm:translate-y-[-4px] sm:translate-x-[-2px]">
          <WhiteboardCanvas 
            className="h-full" 
            onChange={handleChange}
            initialData={initialData}
          />
        </div>
      </main>
    </div>
  );
};

export default WhiteboardPage;
