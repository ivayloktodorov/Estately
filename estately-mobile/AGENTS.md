# Estately Mobile - Expo React Native Instructions

## Project Overview

**Estately Mobile** is a cross-platform real estate browsing application built with Expo and React Native. Users can search properties, view listings, save favorites, and contact property owners. The app communicates with the Next.js backend via RESTful APIs.

---

## Technology Stack

- **Framework**: Expo with Managed Workflow
- **UI Library**: React Native with Expo Router
- **Language**: TypeScript (strict mode)
- **State Management**: React Hooks + Context API
- **HTTP Client**: Fetch API or Axios
- **Authentication**: Bearer token in Authorization header
- **Navigation**: Expo Router (file-based routing)
- **Styling**: StyleSheet + Tailwind CSS compatible (via NativeWind)

---

## Mobile Architecture

### 1. App Structure
```
src/
├── app/               # Expo Router (file-based navigation)
│   ├── (auth)/        # Auth stack
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/        # Main tab navigation
│   │   ├── index.tsx       # Home/Search
│   │   ├── explore.tsx     # Explore listings
│   │   ├── favorites.tsx   # Saved listings
│   │   ├── profile.tsx     # User profile
│   │   └── _layout.tsx
│   └── _layout.tsx    # Root layout
├── components/        # Reusable components
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── modal.tsx
│   └── listing/
│       ├── listing-card.tsx
│       ├── listing-detail.tsx
│       └── search-filter.tsx
├── hooks/             # Custom hooks
│   ├── use-api.ts     # API communication
│   ├── use-auth.ts    # Authentication
│   └── use-listings.ts
├── context/           # Context providers
│   ├── auth-context.tsx
│   └── app-context.tsx
├── services/          # API services
│   ├── api-client.ts
│   ├── auth.ts
│   └── listings.ts
├── types/             # TypeScript types
├── utils/             # Utility functions
└── constants/         # Constants
```

### 2. Layered Architecture
```typescript
// 1. Screen/Page Component (app/listings/[id].tsx)
//    - Render UI
//    - Handle user interactions
//    - Call hooks for data

// 2. Custom Hooks (hooks/use-listings.ts)
//    - Manage component state
//    - Call services
//    - Handle loading/error states

// 3. Service Layer (services/listings.ts)
//    - Call API endpoints
//    - Format data
//    - Cache responses

// 4. API Client (services/api-client.ts)
//    - HTTP requests
//    - Error handling
//    - Token refresh
```

### 3. Example Component Structure
```typescript
// Screen component
'use client';
import { useListings } from '@/hooks/use-listings';
import { ListingCard } from '@/components/listing/listing-card';
import { ActivityIndicator, FlatList } from 'react-native';

export default function ListingsScreen() {
  const { listings, loading, error, refresh } = useListings();
  
  if (loading) return <ActivityIndicator />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;
  
  return (
    <FlatList
      data={listings}
      renderItem={({ item }) => <ListingCard listing={item} />}
      keyExtractor={(item) => item.id}
      onEndReached={loadMore}
    />
  );
}
```

---

## API Communication Rules

### 1. API Client Setup
```typescript
// services/api-client.ts
import { getToken, setToken } from '@/services/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      // Handle token expiration
      await refreshToken();
      return apiClient.request(endpoint, options);
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error.code, error.error.message);
    }
    
    const data = await response.json();
    return data.data;
  },
  
  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  },
  
  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  patch<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },
  
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },
};

export default apiClient;
```

### 2. Service Layer
```typescript
// services/listings.ts
import apiClient from './api-client';
import { Listing, ListingFilters } from '@/types';

export const listingsService = {
  async getAll(page: number = 1, limit: number = 20) {
    return apiClient.get<Listing[]>(
      `/api/listings?page=${page}&limit=${limit}`
    );
  },
  
  async getById(id: string) {
    return apiClient.get<Listing>(`/api/listings/${id}`);
  },
  
  async search(query: string, filters?: ListingFilters) {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    
    return apiClient.get<Listing[]>(`/api/search/listings?${params}`);
  },
  
  async getByAgent(agentId: string) {
    return apiClient.get<Listing[]>(`/api/agents/${agentId}/listings`);
  },
};
```

### 3. Custom Hooks for API Data
```typescript
// hooks/use-listings.ts
import { useState, useEffect } from 'react';
import { listingsService } from '@/services/listings';
import { Listing } from '@/types';

export function useListings(page: number = 1) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listingsService.getAll(page);
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);
  
  const refresh = () => {
    setLoading(true);
    setError(null);
  };
  
  return { listings, loading, error, refresh };
}
```

### 4. Error Handling
```typescript
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string
  ) {
    super(message);
  }
}

// Handle different error types
function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NOT_FOUND':
        return 'Item not found';
      case 'UNAUTHORIZED':
        return 'Please log in again';
      case 'FORBIDDEN':
        return 'You don\'t have permission';
      case 'INVALID_INPUT':
        return 'Invalid input provided';
      default:
        return error.message;
    }
  }
  return 'An unexpected error occurred';
}
```

---

## Mobile UI Guidelines

### 1. Safe Area & Layout
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export function ListingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Content respects notches, status bars, etc. */}
    </SafeAreaView>
  );
}
```

### 2. Touch Targets & Spacing
```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    minHeight: 48, // Minimum touch target (iOS: 44, Android: 48)
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  text: {
    label: { fontSize: 12 },
    body: { fontSize: 16 },
    heading: { fontSize: 20 },
    title: { fontSize: 24 },
  },
});
```

### 3. Platform-Specific UI
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3,
    },
    android: {
      elevation: 5,
    },
  }),
});
```

### 4. Responsive Design
```typescript
import { useWindowDimensions } from 'react-native';

export function ResponsiveLayout() {
  const { width } = useWindowDimensions();
  
  const isTablet = width > 768;
  const numColumns = isTablet ? 2 : 1;
  
  return (
    <FlatList
      data={listings}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? { gap: 16 } : undefined}
    />
  );
}
```

---

## Navigation Structure

### 1. File-Based Routing with Expo Router
```
app/
├── (auth)/
│   ├── _layout.tsx        # Auth navigation stack
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── _layout.tsx        # Bottom tab navigation
│   ├── index.tsx          # Home tab
│   ├── explore.tsx        # Explore tab
│   ├── favorites.tsx      # Favorites tab
│   └── profile.tsx        # Profile tab
├── listings/
│   ├── _layout.tsx        # Detail stack
│   └── [id].tsx          # Listing detail with ID
└── _layout.tsx           # Root navigation
```

### 2. Navigation Implementation
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Search Properties',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerTitle: 'Explore Listings',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          headerTitle: 'Saved Properties',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
```

### 3. Deep Linking
```typescript
// app/_layout.tsx
const linking = {
  prefixes: ['estately://', 'https://estately.app'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          index: 'search',
          explore: 'explore',
          favorites: 'favorites',
          profile: 'profile',
        },
      },
      listings: 'listings/:id',
    },
  },
};
```

---

## Responsive Layouts

### 1. List with Images
```typescript
import { FlatList, Image, Text, View } from 'react-native';

export function ListingsList({ listings }) {
  return (
    <FlatList
      data={listings}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
          />
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </View>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 12,
  },
});
```

### 2. Detail Screen Layout
```typescript
import { ScrollView, Image, View, Text } from 'react-native';

export function ListingDetail({ listing }) {
  return (
    <ScrollView>
      <Image source={{ uri: listing.imageUrl }} style={styles.heroImage} />
      
      <View style={styles.container}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>${listing.price}</Text>
        
        <View style={styles.stats}>
          <Stat label="Beds" value={listing.beds} />
          <Stat label="Baths" value={listing.baths} />
          <Stat label="Area" value={`${listing.area} sqft`} />
        </View>
        
        <Text style={styles.description}>{listing.description}</Text>
        
        <ContactButton agentId={listing.agentId} />
      </View>
    </ScrollView>
  );
}
```

---

## Shared API Usage

### 1. Authentication Service
```typescript
// services/auth.ts
import * as SecureStore from 'expo-secure-store';
import apiClient from './api-client';

export const authService = {
  async login(email: string, password: string) {
    const data = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    
    await SecureStore.setItemAsync('token', data.token);
    return data.user;
  },
  
  async signup(email: string, password: string, name: string) {
    const data = await apiClient.post('/api/auth/signup', {
      email,
      password,
      name,
    });
    
    await SecureStore.setItemAsync('token', data.token);
    return data.user;
  },
  
  async logout() {
    await SecureStore.deleteItemAsync('token');
  },
  
  async getToken() {
    return await SecureStore.getItemAsync('token');
  },
};
```

### 2. Favorites Management
```typescript
// services/favorites.ts
export const favoritesService = {
  async addFavorite(listingId: string) {
    return apiClient.post('/api/favorites', { listingId });
  },
  
  async removeFavorite(listingId: string) {
    return apiClient.delete(`/api/favorites/${listingId}`);
  },
  
  async getFavorites() {
    return apiClient.get('/api/favorites');
  },
  
  async isFavorite(listingId: string) {
    const favorites = await this.getFavorites();
    return favorites.some((fav) => fav.listingId === listingId);
  },
};
```

---

## State Management Guidelines

### 1. Context API for Global State
```typescript
// context/auth-context.tsx
import { createContext, useContext, useState } from 'react';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 2. Local State with Hooks
```typescript
// For component-level state, use useState
const [listings, setListings] = useState<Listing[]>([]);
const [filters, setFilters] = useState<ListingFilters>({});

// For derived state, use useMemo
const filteredListings = useMemo(() => {
  return listings.filter(listing => {
    if (filters.city && listing.city !== filters.city) return false;
    if (filters.minPrice && listing.price < filters.minPrice) return false;
    if (filters.maxPrice && listing.price > filters.maxPrice) return false;
    return true;
  });
}, [listings, filters]);
```

---

## Offline & Error Handling

### 1. Network State Detection
```typescript
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(({ isConnected }) => {
      setIsOnline(isConnected ?? false);
    });
    
    return unsubscribe;
  }, []);
  
  return isOnline;
}

// Usage in screen
const isOnline = useNetworkStatus();

if (!isOnline) {
  return <OfflineMessage />;
}
```

### 2. Error Recovery
```typescript
export function ErrorBoundary({ children }) {
  const [error, setError] = useState<Error | null>(null);
  
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{error.message}</Text>
        <Button
          title="Try Again"
          onPress={() => setError(null)}
        />
      </View>
    );
  }
  
  return (
    <ErrorBoundary.Fallback onError={setError}>
      {children}
    </ErrorBoundary.Fallback>
  );
}
```

### 3. User-Friendly Error Messages
```typescript
// Use alert with Web-compatible fallback modal
import { Alert } from 'react-native';

export function showError(title: string, message: string) {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: () => {},
    },
  ]);
}

// Or use a custom modal for web compatibility
<Modal
  visible={showErrorModal}
  transparent={true}
>
  <View style={styles.overlay}>
    <View style={styles.modal}>
      <Text style={styles.title}>{errorTitle}</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      <Button title="OK" onPress={() => setShowErrorModal(false)} />
    </View>
  </View>
</Modal>
```

---

## Image Loading Optimization

### 1. Cached Image Loading
```typescript
import { Image } from 'react-native';

export function OptimizedImage({ source, style }) {
  const [loading, setLoading] = useState(true);
  
  return (
    <View>
      <Image
        source={source}
        style={style}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && <ActivityIndicator />}
    </View>
  );
}
```

### 2. Image Placeholder
```typescript
import { BlurView } from 'expo-blur';

export function ListingImage({ uri, title }) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <View style={styles.container}>
      {!loaded && (
        <BlurView intensity={90} style={styles.placeholder}>
          <ActivityIndicator />
        </BlurView>
      )}
      <Image
        source={{ uri }}
        style={styles.image}
        onLoadEnd={() => setLoaded(true)}
      />
    </View>
  );
}
```

### 3. Progressive Image Loading
```typescript
// Load thumbnail first, then full resolution
<Image
  source={{ uri: listing.imageUrl }}
  defaultSource={{ uri: listing.thumbnailUrl }}
  style={styles.image}
/>
```

---

## Web-Compatible Native Alerts

### Important: Always provide Modal fallback for web compatibility

```typescript
// Instead of Alert.alert() which doesn't work on web
import { Alert, Modal, View, Text, Button, Platform } from 'react-native';

interface AlertOptions {
  title: string;
  message: string;
  buttons?: Array<{ text: string; onPress?: () => void }>;
}

export function showAlert({ title, message, buttons }: AlertOptions) {
  if (Platform.OS === 'web') {
    // Use custom modal on web
    return <WebAlert title={title} message={message} buttons={buttons} />;
  } else {
    // Use native alert on mobile
    Alert.alert(title, message, buttons);
  }
}

// Web-compatible modal component
export function WebAlert({ title, message, buttons = [] }) {
  const [visible, setVisible] = useState(true);
  
  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <Button
                key={index}
                title={button.text}
                onPress={() => {
                  button.onPress?.();
                  setVisible(false);
                }}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
```

---

## Best Practices Summary

- ✓ Use Expo Router for file-based navigation
- ✓ Implement Bearer token authentication
- ✓ Always handle network errors gracefully
- ✓ Cache API responses where appropriate
- ✓ Use secure storage for sensitive tokens
- ✓ Provide web-compatible fallbacks for native APIs
- ✓ Optimize images with proper sizing
- ✓ Test on both iOS and Android
- ✓ Use TypeScript for type safety
- ✓ Implement proper error boundaries

---

## Related Documentation

- [Global Instructions](../AGENTS.md)
- [Web App Instructions](../estately-web/AGENTS.md)
