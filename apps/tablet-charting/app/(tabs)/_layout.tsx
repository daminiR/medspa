import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    patients: '👥',
    charting: '🎨',
    photos: '📸',
    notes: '📝',
    settings: '⚙️',
  }

  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{icons[name]}</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
          color: '#1e293b',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          headerTitle: 'Select Patient',
          tabBarIcon: ({ focused }) => <TabIcon name="patients" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="charting"
        options={{
          title: 'Face Chart',
          headerTitle: 'Injectable Charting',
          tabBarIcon: ({ focused }) => <TabIcon name="charting" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'Photos',
          headerTitle: 'Photo Documentation',
          tabBarIcon: ({ focused }) => <TabIcon name="photos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'SOAP Notes',
          headerTitle: 'Clinical Documentation',
          tabBarIcon: ({ focused }) => <TabIcon name="notes" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerTitle: 'App Settings',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabIconFocused: {
    backgroundColor: '#f3e8ff',
  },
  tabEmoji: {
    fontSize: 22,
  },
})
