import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { PropertyCard } from '@/components/property/property-card';
import { Button } from '@/components/ui/button';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/use-favorites';
import { getProperties } from '@/services/property.service';
import type { Property, PropertyListFilters } from '@/types/property';

const pageSize = 10;

const cityOptions = ['Sofia', 'Varna', 'Burgas', 'Plovdiv'] as const;
const propertyTypeOptions = ['apartment', 'house', 'villa', 'office', 'land'] as const;
const listingTypeOptions = ['sale', 'rent'] as const;
const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price low to high', value: 'price_asc' },
  { label: 'Price high to low', value: 'price_desc' },
  { label: 'Largest area first', value: 'area_desc' },
] as const;

interface SearchFilters {
  search: string;
  city: string;
  propertyType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  sort: string;
}

const defaultFilters: SearchFilters = {
  search: '',
  city: '',
  propertyType: '',
  listingType: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  sort: 'newest',
};

function flattenProperties(pages: { properties: Property[] }[] | undefined): Property[] {
  return pages?.flatMap((page) => page.properties) ?? [];
}

function parsePositiveNumber(value: string): number | undefined {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : undefined;
}

function toPropertyFilters(filters: SearchFilters, page: number): PropertyListFilters {
  return {
    page,
    limit: pageSize,
    search: filters.search.trim() || undefined,
    city: filters.city || undefined,
    propertyType: filters.propertyType || undefined,
    listingType: filters.listingType || undefined,
    minPrice: parsePositiveNumber(filters.minPrice),
    maxPrice: parsePositiveNumber(filters.maxPrice),
    bedrooms: parsePositiveNumber(filters.bedrooms),
    bathrooms: parsePositiveNumber(filters.bathrooms),
    sort: filters.sort,
  };
}

function formatFilterLabel(value: string): string {
  return value
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`min-h-11 rounded-full border px-4 py-2 ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-slate-300 bg-white'
      }`}
      onPress={onPress}>
      <Text className={`text-sm font-semibold ${selected ? 'text-brand-700' : 'text-slate-700'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

interface FilterGroupProps {
  title: string;
  children: ReactNode;
}

function FilterGroup({ title, children }: FilterGroupProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-slate-700">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

interface NumericFilterProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}

function NumericFilter({ label, value, onChangeText, placeholder }: NumericFilterProps) {
  return (
    <View className="min-w-[46%] flex-1 gap-2">
      <Text className="text-sm font-semibold text-slate-700">{label}</Text>
      <TextInput
        className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900"
        inputMode="numeric"
        keyboardType="number-pad"
        onChangeText={(nextValue) => onChangeText(nextValue.replace(/[^0-9]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
      />
    </View>
  );
}

export default function SearchScreen() {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const favoriteIds = useFavoriteIds();
  const toggleFavoriteMutation = useToggleFavorite();
  const searchQuery = useInfiniteQuery({
    queryKey: ['properties', 'search', filters],
    queryFn: ({ pageParam }) => getProperties(toPropertyFilters(filters, pageParam)),
    initialPageParam: 1,
    retry: false,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
  });
  const properties = flattenProperties(searchQuery.data?.pages);
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  function updateFilter<TKey extends keyof SearchFilters>(key: TKey, value: SearchFilters[TKey]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleFilter<TKey extends keyof SearchFilters>(key: TKey, value: string) {
    setFilters((current) => ({ ...current, [key]: current[key] === value ? '' : value }));
  }

  function handleLoadMore() {
    if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
      searchQuery.fetchNextPage();
    }
  }

  return (
    <FlatList
      className="flex-1 bg-slate-50"
      contentContainerClassName="gap-4 px-5 py-6"
      data={properties}
      keyExtractor={(property) => String(property.id)}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <View className="rounded-lg border border-slate-200 bg-white p-6">
          {searchQuery.isPending ? (
            <View className="items-center gap-3">
              <ActivityIndicator color="#16a34a" />
              <Text className="text-base text-slate-600">Loading search results...</Text>
            </View>
          ) : searchQuery.isError ? (
            <View className="gap-4">
              <Text className="text-center text-base font-medium text-red-600">
                Unable to load search results.
              </Text>
              <Button label="Try again" onPress={() => searchQuery.refetch()} variant="secondary" />
            </View>
          ) : (
            <View className="gap-2">
              <Text className="text-center text-2xl font-bold text-slate-950">No properties found.</Text>
              <Text className="text-center text-base text-slate-600">Try changing your filters.</Text>
            </View>
          )}
        </View>
      }
      ListFooterComponent={
        properties.length > 0 ? (
          <View className="pb-4 pt-2">
            {searchQuery.hasNextPage ? (
              <Button
                disabled={searchQuery.isFetchingNextPage}
                label={searchQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
                onPress={handleLoadMore}
                variant="secondary"
              />
            ) : (
              <Text className="text-center text-sm text-slate-500">You have reached the end.</Text>
            )}
          </View>
        ) : null
      }
      ListHeaderComponent={
        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-4xl font-bold text-slate-950">Search</Text>
            <Text className="text-base text-slate-600">Search and filter Estately listings.</Text>
          </View>

          <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-slate-700">Location or keyword</Text>
              <TextInput
                className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900"
                onChangeText={(value) => updateFilter('search', value)}
                placeholder="Title, city, address, or keyword"
                placeholderTextColor="#94a3b8"
                returnKeyType="search"
                value={filters.search}
              />
            </View>

            <FilterGroup title="City">
              {cityOptions.map((city) => (
                <FilterChip
                  key={city}
                  label={city}
                  onPress={() => toggleFilter('city', city)}
                  selected={filters.city === city}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Property type">
              {propertyTypeOptions.map((propertyType) => (
                <FilterChip
                  key={propertyType}
                  label={formatFilterLabel(propertyType)}
                  onPress={() => toggleFilter('propertyType', propertyType)}
                  selected={filters.propertyType === propertyType}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Listing type">
              {listingTypeOptions.map((listingType) => (
                <FilterChip
                  key={listingType}
                  label={formatFilterLabel(listingType)}
                  onPress={() => toggleFilter('listingType', listingType)}
                  selected={filters.listingType === listingType}
                />
              ))}
            </FilterGroup>

            <View className="flex-row flex-wrap gap-3">
              <NumericFilter
                label="Min price"
                onChangeText={(value) => updateFilter('minPrice', value)}
                placeholder="Any"
                value={filters.minPrice}
              />
              <NumericFilter
                label="Max price"
                onChangeText={(value) => updateFilter('maxPrice', value)}
                placeholder="Any"
                value={filters.maxPrice}
              />
              <NumericFilter
                label="Min bedrooms"
                onChangeText={(value) => updateFilter('bedrooms', value)}
                placeholder="Any"
                value={filters.bedrooms}
              />
              <NumericFilter
                label="Min bathrooms"
                onChangeText={(value) => updateFilter('bathrooms', value)}
                placeholder="Any"
                value={filters.bathrooms}
              />
            </View>

            <FilterGroup title="Sort">
              {sortOptions.map((sortOption) => (
                <FilterChip
                  key={sortOption.value}
                  label={sortOption.label}
                  onPress={() => updateFilter('sort', sortOption.value)}
                  selected={filters.sort === sortOption.value}
                />
              ))}
            </FilterGroup>

            <Button
              disabled={!hasActiveFilters}
              label="Clear filters"
              onPress={() => setFilters(defaultFilters)}
              variant="secondary"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-950">Results</Text>
            {searchQuery.isFetching && !searchQuery.isFetchingNextPage ? (
              <Text className="text-sm font-medium text-slate-500">Updating...</Text>
            ) : null}
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <PropertyCard
          isFavorite={favoriteIds.has(item.id)}
          isFavoriteLoading={
            toggleFavoriteMutation.isPending &&
            toggleFavoriteMutation.variables?.property.id === item.id
          }
          onFavoritePress={() =>
            toggleFavoriteMutation.mutate({ property: item, isFavorite: favoriteIds.has(item.id) })
          }
          onPress={() => router.push(`/property/${item.id}`)}
          property={item}
        />
      )}
    />
  );
}
