import * as SplashScreen from 'expo-splash-screen';

type Destination = 'tabs' | 'onboarding';

const MIN_SPLASH_VISIBLE_MS = 2500;
const splashStartedAt = Date.now();

let _intended: Destination | null = null;
let _overlayHider: (() => void) | null = null;
let _overlayHidden = false;

export function setIntendedDestination(dest: Destination) {
  _intended = dest;
  _overlayHidden = false;
}

export function registerOverlayHider(hider: () => void) {
  _overlayHider = hider;
  if (_overlayHidden) {
    hider();
  }
}

export function hideLaunchCover() {
  _overlayHidden = true;
  _overlayHider?.();
}

async function waitForMinimumSplashTime() {
  const elapsed = Date.now() - splashStartedAt;
  const remaining = MIN_SPLASH_VISIBLE_MS - elapsed;

  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining));
  }
}

export async function signalReady(screen: Destination) {
  if (_intended === screen) {
    try {
      await waitForMinimumSplashTime();
      await SplashScreen.hideAsync();
    } finally {
      hideLaunchCover();
      _intended = null;
    }
  }
}
