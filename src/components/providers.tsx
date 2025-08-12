"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { useEffect, useState } from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mswReady, setMswReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Don't render children until we're on the client side and MSW is ready (if needed)
  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USE_MSW === "true" &&
    !mswReady
  ) {
    return <div>Initializing...</div>;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
