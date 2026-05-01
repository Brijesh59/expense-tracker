import { useLumaStore } from '@/db/store';

export function useSettings() {
  const getSetting = useLumaStore(s => s.getSetting);
  const setSetting = useLumaStore(s => s.setSetting);
  return { getSetting, setSetting };
}
