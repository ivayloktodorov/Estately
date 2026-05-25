import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
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
  const [heroImageUrl, ...secondaryImageUrls] = imageUrls;
  const heroHeight = Math.min(320, Math.max(240, Math.round(width * 0.68)));

  if (!heroImageUrl) {
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
        source={{ uri: heroImageUrl }}
        style={{ height: heroHeight }}
      />

      {secondaryImageUrls.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {secondaryImageUrls.map((imageUrl) => (
              <Image
                className="h-24 w-32 rounded-lg bg-slate-200"
                key={imageUrl}
                resizeMode="cover"
                source={{ uri: imageUrl }}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
