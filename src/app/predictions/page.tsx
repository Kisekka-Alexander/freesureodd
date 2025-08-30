"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PredictionsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page for general predictions
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
}
