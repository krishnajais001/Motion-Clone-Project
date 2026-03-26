import { useState, useCallback, useMemo } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useUIStore } from "@/stores/useUIStore";

interface WhiteboardProps {
  initialData?: any;
  onChange?: (elements: readonly any[], appState: any) => void;
  className?: string;
}

/**
 * A reusable Whiteboard component using Excalidraw.
 * 
 * NOTE: We use `any` for Excalidraw internal types (elements, appState) 
 * to ensure compatibility with Vite's strict import analysis.
 */
export const WhiteboardCanvas = ({ initialData, onChange, className }: WhiteboardProps) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const theme = useUIStore((s) => s.theme);

  // Stable API callback to prevent re-render loops
  const handleExcalidrawAPI = useCallback((api: any) => {
    if (excalidrawAPI !== api) {
      setExcalidrawAPI(api);
    }
  }, [excalidrawAPI]);

  // Stable UIOptions to prevent re-render loops
  const UIOptions = useMemo(() => ({
    canvasActions: {
      loadScene: true,
      export: {
        saveFileToDisk: true,
      },
      saveAsImage: true,
      toggleTheme: false,
    },
    welcomeScreen: false,
  }), []);

  return (
    <div 
      className={`relative w-full h-full border border-border rounded-none bg-background shadow-[4px_4px_0px_#000000] dark:shadow-none overflow-hidden ${className}`}
    >
      <Excalidraw
        excalidrawAPI={handleExcalidrawAPI}
        initialData={initialData}
        onChange={onChange}
        theme={theme === 'dark' ? 'dark' : 'light'}
        UIOptions={UIOptions}
      />
    </div>
  );
};

export default WhiteboardCanvas;
