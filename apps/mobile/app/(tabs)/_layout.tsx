import { Tabs } from 'expo-router';
import { ColorValue, Text } from 'react-native';

interface TabIconProps {
  color: ColorValue;
  symbol: string;
}

function TabIcon({ color, symbol }: TabIconProps) {
  return (
    <Text aria-hidden className="text-xl font-bold" style={{ color }}>
      {symbol}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#64748b',
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="⌂" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="⌕" />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="♡" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon color={color} symbol="○" />,
        }}
      />
    </Tabs>
  );
}
