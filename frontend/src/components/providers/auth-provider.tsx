'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/use-auth-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    // Sync store with localStorage on client-side mount
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
