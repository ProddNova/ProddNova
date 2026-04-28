'use client';

import { PropsWithChildren, useEffect, useState } from 'react';

type AuthState =
  | { loading: true }
  | { loading: false; username: string }
  | { loading: false; error: string };

export function AuthGate({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ loading: true });

  useEffect(() => {
    const run = async () => {
      try {
        const me = await fetch('/api/auth/me', { cache: 'no-store' });
        if (me.ok) {
          const data = await me.json();
          setState({ loading: false, username: data.user.username });
          return;
        }

        const auto = await fetch('/api/auth/auto-login', { method: 'POST' });
        if (!auto.ok) {
          const err = await auto.json();
          throw new Error(err.error ?? 'Cannot perform auto-login');
        }

        const data = await auto.json();
        setState({ loading: false, username: data.user.username });
      } catch (error) {
        setState({ loading: false, error: error instanceof Error ? error.message : 'Authentication failed' });
      }
    };

    void run();
  }, []);

  if (state.loading) {
    return <p className="panel text-sm">Bootstrapping secure session...</p>;
  }

  if ('error' in state) {
    return <p className="panel text-sm text-red-400">Auth error: {state.error}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="panel text-xs text-urban-300">
        Logged in as <span className="font-semibold text-urban-100">{state.username}</span> (auto-login enabled).
      </div>
      {children}
    </div>
  );
}
