import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabIconProps {
  color: ColorValue;
  name: keyof typeof Ionicons.glyphMap;
}

function TabIcon({ color, name }: TabIconProps) {
  return <Ionicons aria-hidden color={color} name={name} size={23} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 76 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          lineHeight: 16,
          paddingBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          minHeight: 56,
        },
        tabBarStyle: {
          height: tabBarHeight,
          minHeight: tabBarHeight,
          paddingBottom: Math.max(insets.bottom + 4, 12),
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="home-outline" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="search-outline" />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="heart-outline" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="person-outline" />,
        }}
      />
      <Tabs.Screen
        name="property/[id]/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="property/new/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/edit/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/properties/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
