import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { t } from '@/lib/i18n';
import type { PropertyDetails } from '@/types/property';

interface PropertyImageGalleryProps {
  property: PropertyDetails;
}

function imageUrlsForProperty(property: PropertyDetails): string[] {
  const urls = [
    property.imageCoverUrl,
    ...property.images.map((image) => image.imageUrl),
  ].filter(Boolean);

  return Array.from(new Set(urls));
}

export function PropertyImageGallery({ property }: PropertyImageGalleryProps) {
  const { width } = useWindowDimensions();
  const imageUrls = imageUrlsForProperty(property);
  const [selectedImageUrl, setSelectedImageUrl] = useState(imageUrls[0]);
  const heroHeight = Math.min(320, Math.max(240, Math.round(width * 0.68)));

  useEffect(() => {
    setSelectedImageUrl(imageUrls[0]);
  }, [imageUrls[0]]);

  if (!selectedImageUrl) {
    return (
      <View className="items-center justify-center rounded-xl bg-slate-200" style={{ height: heroHeight }}>
        <Text className="text-base font-medium text-slate-500">{t('noImagesAvailable')}</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <Image
        className="w-full rounded-xl bg-slate-200"
        resizeMode="cover"
        source={{ uri: selectedImageUrl }}
        style={{ height: heroHeight }}
      />

      {imageUrls.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {imageUrls.map((imageUrl) => {
              const isActive = imageUrl === selectedImageUrl;

              return (
                <Pressable
                  accessibilityLabel="Select property image"
                  accessibilityRole="button"
                  className={`rounded-xl border-2 p-0.5 ${
                    isActive ? 'border-emerald-600 bg-emerald-50' : 'border-transparent bg-transparent'
                  }`}
                  key={imageUrl}
                  onPress={() => setSelectedImageUrl(imageUrl)}>
                  <Image
                    className="h-24 w-32 rounded-lg bg-slate-200"
                    resizeMode="cover"
                    source={{ uri: imageUrl }}
                  />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
