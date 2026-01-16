// Initialize Reactotron FIRST (before any other imports)
import './src/config/ReactotronConfig';

// Custom Expo Router entry point for monorepo
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Must be exported or Fast Refresh won't update the context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
