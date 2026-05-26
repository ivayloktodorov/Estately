import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { createMobileProperty, type CreatePropertyInput } from '@/services/mobile-property-create.service';

const cities = ['Sofia', 'Varna', 'Burgas', 'Plovdiv'];
const propertyTypes = ['apartment', 'house', 'villa', 'office', 'land'];
const listingTypes = ['sale', 'rent'];

const initialForm: CreatePropertyInput = {
  title: '',
  description: '',
  price: '',
  city: 'Sofia',
  address: '',
  propertyType: 'apartment',
  listingType: 'sale',
  bedrooms: '',
  bathrooms: '',
  areaSqm: '',
  images: [],
};

async function pickImages(): Promise<{ dataUrl: string; fileName?: string }[]> {
  if (Platform.OS !== 'web') {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      base64: true,
      mediaTypes: ['images'],
      quality: 0.82,
    });

    if (result.canceled) return [];

    return result.assets
      .slice(0, 10)
      .filter((asset) => Boolean(asset.base64))
      .map((asset) => ({
        dataUrl: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`,
        fileName: asset.fileName ?? 'property.jpg',
      }));
  }

  if (typeof document === 'undefined') return [];

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []).slice(0, 10);
      const images = await Promise.all(files.map((file) => new Promise<{ dataUrl: string; fileName?: string } | null>((resolveFile) => {
        const reader = new FileReader();
        reader.onload = () => resolveFile({ dataUrl: String(reader.result), fileName: file.name });
        reader.onerror = () => resolveFile(null);
        reader.readAsDataURL(file);
      })));
      resolve(images.filter((image): image is { dataUrl: string; fileName?: string } => Boolean(image)));
    };
    input.click();
  });
}

function OptionRow({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            accessibilityRole="button"
            className={`min-h-11 rounded-full border px-4 py-2 ${selected ? 'border-brand-600 bg-brand-50' : 'border-slate-300 bg-white'}`}
            key={option}
            onPress={() => onChange(option)}>
            <Text className={`font-semibold ${selected ? 'text-brand-700' : 'text-slate-700'}`}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AddPropertyScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreatePropertyInput>(initialForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: createMobileProperty,
    onSuccess: (result) => {
      setNotice('Property submitted for moderation.');
      setError('');
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      router.push(`/property/${result.id}`);
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice('');
    },
  });

  function update<TKey extends keyof CreatePropertyInput>(key: TKey, value: CreatePropertyInput[TKey]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Screen scroll>
      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">Add Property</Text>
          <Text className="text-base text-slate-600">Create a listing for review.</Text>
        </View>
        {notice ? <Text className="rounded-lg bg-emerald-50 p-3 font-semibold text-emerald-700">{notice}</Text> : null}
        {error ? <Text className="rounded-lg bg-red-50 p-3 font-semibold text-red-700">{error}</Text> : null}
        <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <TextField label="Title" onChangeText={(value) => update('title', value)} value={form.title} />
          <TextField label="Description" multiline onChangeText={(value) => update('description', value)} value={form.description} />
          <TextField inputMode="decimal" keyboardType="decimal-pad" label="Price in EUR" onChangeText={(value) => update('price', value.replace(/[^0-9.]/g, ''))} value={form.price} />
          <TextField label="Address" onChangeText={(value) => update('address', value)} value={form.address} />
          <Text className="font-semibold text-slate-700">City</Text>
          <OptionRow options={cities} value={form.city} onChange={(value) => update('city', value)} />
          <Text className="font-semibold text-slate-700">Property type</Text>
          <OptionRow options={propertyTypes} value={form.propertyType} onChange={(value) => update('propertyType', value)} />
          <Text className="font-semibold text-slate-700">Listing type</Text>
          <OptionRow options={listingTypes} value={form.listingType} onChange={(value) => update('listingType', value)} />
          <TextField inputMode="numeric" keyboardType="number-pad" label="Bedrooms" onChangeText={(value) => update('bedrooms', value.replace(/[^0-9]/g, ''))} value={form.bedrooms} />
          <TextField inputMode="numeric" keyboardType="number-pad" label="Bathrooms" onChangeText={(value) => update('bathrooms', value.replace(/[^0-9]/g, ''))} value={form.bathrooms} />
          <TextField inputMode="numeric" keyboardType="number-pad" label="Area sqm" onChangeText={(value) => update('areaSqm', value.replace(/[^0-9]/g, ''))} value={form.areaSqm} />
          <Button label={`Choose images${form.images?.length ? ` (${form.images.length})` : ''}`} onPress={async () => update('images', await pickImages())} variant="secondary" />
          <Button disabled={mutation.isPending} label={mutation.isPending ? 'Creating...' : 'Create property'} onPress={() => mutation.mutate(form)} />
        </View>
      </View>
    </Screen>
  );
}
