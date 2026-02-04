"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type AlertState = {
  title: string;
  description: string;
  open: boolean;
};

type AlertContextValue = {
  showAlert: (opts: { title: string; description: string }) => void;
  AlertComponent: () => React.ReactNode;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({ title: "", description: "", open: false });

  const showAlert = useCallback((opts: { title: string; description: string }) => {
    setAlert({ title: opts.title, description: opts.description, open: true });
  }, []);

  const close = useCallback(() => {
    setAlert((a) => ({ ...a, open: false }));
  }, []);

  const AlertComponent = useCallback(
    () =>
      alert.open ? (
        <div
          role="alert"
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border bg-background p-4 shadow-lg"
        >
          <p className="font-semibold">{alert.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
          <button
            type="button"
            onClick={close}
            className="mt-3 text-sm text-primary hover:underline"
          >
            ปิด
          </button>
        </div>
      ) : null,
    [alert.open, alert.title, alert.description, close]
  );

  return (
    <AlertContext.Provider value={{ showAlert, AlertComponent }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    return {
      showAlert: () => {},
      AlertComponent: () => null,
    };
  }
  return ctx;
}
