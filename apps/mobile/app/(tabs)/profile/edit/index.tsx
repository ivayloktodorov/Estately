import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from 'react-native';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { getCurrentUser } from '@/services/auth.service';
import { changePassword, updateProfile, uploadAvatar } from '@/services/profile.service';

async function pickImageDataUrl(): Promise<{ dataUrl: string; fileName?: string } | null> {
  if (Platform.OS !== 'web') {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      base64: true,
      mediaTypes: ['images'],
      quality: 0.82,
    });

    if (result.canceled || !result.assets[0]?.base64) return null;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    return { dataUrl: `data:${mimeType};base64,${asset.base64}`, fileName: asset.fileName ?? 'avatar.jpg' };
  }

  if (typeof document === 'undefined') return null;

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result), fileName: file.name });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

export default function EditProfileScreen() {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: getCurrentUser, retry: false });
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const profile = profileQuery.data;

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setEmail(profile.email);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['auth', 'me'], updatedProfile);
      setNotice('Profile updated successfully.');
      setError('');
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice('');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Password changed successfully.');
      setError('');
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice('');
    },
  });

  const avatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setNotice('Avatar updated successfully.');
      setError('');
    },
    onError: (mutationError: Error) => {
      setError(mutationError.message);
      setNotice('');
    },
  });

  if (profileQuery.isPending) {
    return <Screen><View className="flex-1 items-center justify-center"><ActivityIndicator color="#16a34a" /></View></Screen>;
  }

  return (
    <Screen scroll>
      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-3xl font-bold text-slate-950">Edit Profile</Text>
          <Text className="text-base text-slate-600">Update your account details.</Text>
        </View>

        {notice ? <Text className="rounded-lg bg-emerald-50 p-3 font-semibold text-emerald-700">{notice}</Text> : null}
        {error ? <Text className="rounded-lg bg-red-50 p-3 font-semibold text-red-700">{error}</Text> : null}

        <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
          {profile?.avatarUrl ? <Image className="h-24 w-24 self-center rounded-full" source={{ uri: profile.avatarUrl }} /> : null}
          <Button
            disabled={avatarMutation.isPending}
            label={avatarMutation.isPending ? 'Uploading...' : 'Upload avatar'}
            onPress={async () => {
              const image = await pickImageDataUrl();
              if (image) avatarMutation.mutate(image);
            }}
            variant="secondary"
          />
        </View>

        <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <TextField label="Full name" onChangeText={setFullName} value={fullName} />
          <TextField autoCapitalize="none" keyboardType="email-address" label="Email" onChangeText={setEmail} value={email} />
          <Button disabled={updateMutation.isPending} label={updateMutation.isPending ? 'Saving...' : 'Save profile'} onPress={() => updateMutation.mutate({ fullName, email })} />
        </View>

        <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <Text className="text-xl font-bold text-slate-950">Change password</Text>
          <TextField label="Current password" onChangeText={setCurrentPassword} secureTextEntry value={currentPassword} />
          <TextField label="New password" onChangeText={setNewPassword} secureTextEntry value={newPassword} />
          <TextField label="Confirm new password" onChangeText={setConfirmPassword} secureTextEntry value={confirmPassword} />
          <Button disabled={passwordMutation.isPending} label={passwordMutation.isPending ? 'Updating...' : 'Change password'} onPress={() => passwordMutation.mutate({ currentPassword, newPassword, confirmPassword })} />
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text className="text-center font-semibold text-slate-600">Back</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
