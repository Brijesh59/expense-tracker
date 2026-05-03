import * as SplashScreen from 'expo-splash-screen';

type Destination = 'tabs' | 'onboarding';

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

export async function signalReady(screen: Destination) {
  if (_intended === screen) {
    try {
      await SplashScreen.hideAsync();
    } finally {
      hideLaunchCover();
      _intended = null;
    }
  }
}
