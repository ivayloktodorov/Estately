import { Text, TextInput, TextInputProps, View } from 'react-native';

interface TextFieldProps extends TextInputProps {
  label: string;
}

export function TextField({ label, ...props }: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-slate-700">{label}</Text>
      <TextInput
        className="h-12 rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900"
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
  );
}
