"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider } from "next-auth/react";
import { store, persistor } from "@/store";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    const initMSW = async () => {
      // Only initialize MSW in the browser and in development mode
      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_USE_MSW === "true"
      ) {
        try {
          const { worker } = await import("@/mocks/browser");
          await worker.start({
            onUnhandledRequest: "bypass",
          });
          console.log("MSW started successfully");
        } catch (error) {
          console.error("Failed to start MSW:", error);
        }
      } else {
        console.log("Using real backend - MSW disabled or not in browser");
      }
      setMswReady(true);
    };

    initMSW();
  }, []);

  // Don't render children until MSW is ready in development (only if MSW is enabled and in browser)
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USE_MSW === "true" &&
    !mswReady
  ) {
    return <div>Initializing...</div>;
  }

  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}
