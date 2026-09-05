'use client';

import React from 'react';
import { AppProvider } from '@/src/context/AppContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { MotionConfig } from 'motion/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <MotionConfig transition={{ duration: 0.2 }}>
          {children}
        </MotionConfig>
      </AppProvider>
    </AuthProvider>
  );
}