import React, { useEffect } from 'react';
import { useLumaStore } from './store';

interface Props {
  children: React.ReactNode;
  onReady: () => void;
}

export function DatabaseProvider({ children, onReady }: Props) {
  const initialize = useLumaStore(s => s.initialize);

  useEffect(() => {
    initialize().then(onReady);
  }, []);

  return <>{children}</>;
}
