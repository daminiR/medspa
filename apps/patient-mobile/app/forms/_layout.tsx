/**
 * Forms Layout
 *
 * Stack navigator for form-related screens.
 */

import { Stack } from 'expo-router';

export default function FormsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: 'Forms',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="[formId]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          headerShown: true,
          headerTitle: 'Form History',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
