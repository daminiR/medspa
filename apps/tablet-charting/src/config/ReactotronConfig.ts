import Reactotron from 'reactotron-react-native';
import { Platform } from 'react-native';

// Only configure Reactotron in development
if (__DEV__) {
  // Get the host IP for connecting to Reactotron desktop app
  const hostIP = Platform.select({
    ios: 'localhost', // Works when running on simulator or via USB
    android: '10.0.2.2', // Android emulator
  });

  Reactotron
    .configure({
      name: 'Medical Spa Charting',
      host: hostIP, // Change to your computer's IP if needed
    })
    .useReactNative({
      asyncStorage: false, // Enable if you use AsyncStorage
      networking: {
        // Optionally, you can ignore certain URLs
        ignoreUrls: /symbolicate/,
      },
      editor: false, // Open app in your editor from Reactotron
      errors: { veto: (stackFrame) => false }, // Control error reporting
      overlay: false, // Show overlay with FPS/memory
    })
    .connect();

  // Clear Reactotron on app load
  Reactotron.clear();

  console.log('Reactotron Configured');
}

// Export a console wrapper that also logs to Reactotron
export const log = (...args: any[]) => {
  if (__DEV__) {
    console.log(...args);
    Reactotron.log(...args);
  }
};

export const logError = (...args: any[]) => {
  if (__DEV__) {
    console.error(...args);
    Reactotron.error(args[0], args.length > 1 ? args.slice(1) : undefined);
  }
};

export const logWarn = (...args: any[]) => {
  if (__DEV__) {
    console.warn(...args);
    Reactotron.warn(args.length === 1 ? args[0] : JSON.stringify(args));
  }
};

export default Reactotron;
