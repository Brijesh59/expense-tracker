import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

const METERING_INTERVAL_MS = 60;

// Normalize expo-av dBFS metering (-160..0) to 0..1
// Typical quiet room: -50 dBFS, loud speech: -10 dBFS
function normalize(dBFS: number): number {
  return Math.max(0, Math.min(1, (dBFS + 55) / 45));
}

export function useAudioMeter(active: boolean): number {
  const [volume, setVolume] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const stopMeter = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) return;
    try {
      await rec.stopAndUnloadAsync();
    } catch {}
    setVolume(0);
  }, []);

  const startMeter = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        isMeteringEnabled: true,
        android: {
          extension: '.3gp',
          outputFormat: Audio.AndroidOutputFormat.THREE_GPP,
          audioEncoder: Audio.AndroidAudioEncoder.AMR_NB,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 32000,
        },
        ios: {
          extension: '.caf',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.MIN,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 32000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      rec.setProgressUpdateInterval(METERING_INTERVAL_MS);
      rec.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          setVolume(normalize(status.metering));
        }
      });

      await rec.startAsync();
      recordingRef.current = rec;
    } catch (e) {
      // Falls back gracefully — waveform just stays at base scale
      console.warn('[AudioMeter] could not start:', e);
    }
  }, []);

  useEffect(() => {
    if (active) {
      startMeter();
    } else {
      stopMeter();
    }
    return () => { stopMeter(); };
  }, [active]);

  return volume;
}
