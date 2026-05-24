import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { PropertyCard } from '@/components/property/property-card';
import { Button } from '@/components/ui/button';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/use-favorites';
import { t } from '@/lib/i18n';
import { getProperties } from '@/services/property.service';
import type { Property, PropertyListFilters } from '@/types/property';

const pageSize = 10;

const cityOptions = ['Sofia', 'Varna', 'Burgas', 'Plovdiv'] as const;
const propertyTypeOptions = ['apartment', 'house', 'villa', 'office', 'land'] as const;
const listingTypeOptions = ['sale', 'rent'] as const;
const sortOptions = [
  { labelKey: 'newestFirst', value: 'newest' },
  { labelKey: 'priceLowHigh', value: 'price_asc' },
  { labelKey: 'priceHighLow', value: 'price_desc' },
  { labelKey: 'largestAreaFirst', value: 'area_desc' },
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
  const labels: Record<string, string> = {
    apartment: t('apartment'),
    house: t('house'),
    villa: t('villa'),
    office: t('office'),
    land: t('land'),
    sale: t('saleLabel'),
    rent: t('rentLabel'),
  };

  return labels[value] ?? value;
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
              <Text className="text-base text-slate-600">{t('loadingSearchResults')}</Text>
            </View>
          ) : searchQuery.isError ? (
            <View className="gap-4">
              <Text className="text-center text-base font-medium text-red-600">
                {t('unableToLoadSearchResults')}
              </Text>
              <Button label={t('tryAgain')} onPress={() => searchQuery.refetch()} variant="secondary" />
            </View>
          ) : (
            <View className="gap-2">
              <Text className="text-center text-2xl font-bold text-slate-950">{t('noPropertiesFound')}</Text>
              <Text className="text-center text-base text-slate-600">{t('tryChangingFilters')}</Text>
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
                label={searchQuery.isFetchingNextPage ? t('loading') : t('loadMore')}
                onPress={handleLoadMore}
                variant="secondary"
              />
            ) : (
              <Text className="text-center text-sm text-slate-500">{t('endOfResults')}</Text>
            )}
          </View>
        ) : null
      }
      ListHeaderComponent={
        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-4xl font-bold text-slate-950">{t('search')}</Text>
            <Text className="text-base text-slate-600">{t('searchAndFilterListings')}</Text>
          </View>

          <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-slate-700">{t('locationOrKeyword')}</Text>
              <TextInput
                className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900"
                onChangeText={(value) => updateFilter('search', value)}
                placeholder={t('searchMobilePlaceholder')}
                placeholderTextColor="#94a3b8"
                returnKeyType="search"
                value={filters.search}
              />
            </View>

            <FilterGroup title={t('city')}>
              {cityOptions.map((city) => (
                <FilterChip
                  key={city}
                  label={city}
                  onPress={() => toggleFilter('city', city)}
                  selected={filters.city === city}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={t('propertyType')}>
              {propertyTypeOptions.map((propertyType) => (
                <FilterChip
                  key={propertyType}
                  label={formatFilterLabel(propertyType)}
                  onPress={() => toggleFilter('propertyType', propertyType)}
                  selected={filters.propertyType === propertyType}
                />
              ))}
            </FilterGroup>

            <FilterGroup title={t('listingType')}>
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
                label={t('minPrice')}
                onChangeText={(value) => updateFilter('minPrice', value)}
                placeholder={t('any')}
                value={filters.minPrice}
              />
              <NumericFilter
                label={t('maxPrice')}
                onChangeText={(value) => updateFilter('maxPrice', value)}
                placeholder={t('any')}
                value={filters.maxPrice}
              />
              <NumericFilter
                label={t('minBedrooms')}
                onChangeText={(value) => updateFilter('bedrooms', value)}
                placeholder={t('any')}
                value={filters.bedrooms}
              />
              <NumericFilter
                label={t('minBathrooms')}
                onChangeText={(value) => updateFilter('bathrooms', value)}
                placeholder={t('any')}
                value={filters.bathrooms}
              />
            </View>

            <FilterGroup title={t('sort')}>
              {sortOptions.map((sortOption) => (
                <FilterChip
                  key={sortOption.value}
                  label={t(sortOption.labelKey)}
                  onPress={() => updateFilter('sort', sortOption.value)}
                  selected={filters.sort === sortOption.value}
                />
              ))}
            </FilterGroup>

            <Button
              disabled={!hasActiveFilters}
              label={t('clearFilters')}
              onPress={() => setFilters(defaultFilters)}
              variant="secondary"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-950">{t('results')}</Text>
            {searchQuery.isFetching && !searchQuery.isFetchingNextPage ? (
              <Text className="text-sm font-medium text-slate-500">{t('updating')}</Text>
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
