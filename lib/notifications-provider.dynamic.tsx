"use client";
import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load the heavy NotificationsProvider (websocket setup) after hydration
const LazyNotificationsProvider = dynamic(() => import('./notifications-context').then(m => ({
  default: m.NotificationsProvider,
})), {
  ssr: false,
  loading: () => <div className="hidden" />,
});

export default function NotificationsProviderDynamic({ children }: { children: React.ReactNode }) {
  return <LazyNotificationsProvider>{children}</LazyNotificationsProvider>;
}
