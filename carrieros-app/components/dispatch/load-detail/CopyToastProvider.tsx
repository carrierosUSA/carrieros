"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type CopyToastContextValue = {
  showCopied: () => void;
};

const CopyToastContext = createContext<CopyToastContextValue | null>(null);

export function useCopyToast(): CopyToastContextValue {
  const context = useContext(CopyToastContext);
  if (!context) {
    throw new Error("useCopyToast must be used within CopyToastProvider");
  }
  return context;
}

type CopyToastProviderProps = {
  children: ReactNode;
};

export default function CopyToastProvider({ children }: CopyToastProviderProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCopied = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(true);
    timeoutRef.current = setTimeout(() => setVisible(false), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <CopyToastContext.Provider value={{ showCopied }}>
      {children}
      {visible ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-full bg-slate-900/92 px-3.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] text-white shadow-[0_4px_20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
            Copied
          </div>
        </div>
      ) : null}
    </CopyToastContext.Provider>
  );
}
