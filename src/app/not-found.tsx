"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // For S3 deployment, we need to handle client-side routing
    // This will redirect back to index.html which will handle the routing
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // If it's a dynamic route, redirect to home and let client routing handle it
      if (currentPath.includes('/leagues/') || 
          currentPath.includes('/predictions/') ||
          currentPath.includes('/auth/')) {
        // Use replace to avoid loop
        window.history.replaceState({}, '', currentPath);
        router.replace('/');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <p className="mt-2 text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
