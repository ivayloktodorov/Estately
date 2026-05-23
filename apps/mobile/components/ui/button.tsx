import { Pressable, Text } from 'react-native';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, disabled = false, variant = 'primary' }: ButtonProps) {
  const enabledClassName =
    variant === 'primary' ? 'bg-brand-600 active:bg-brand-700' : 'border border-slate-300 bg-white active:bg-slate-100';
  const className = disabled ? 'bg-slate-300' : enabledClassName;
  const textClassName = variant === 'primary' ? 'text-white' : 'text-slate-900';

  return (
    <Pressable
      accessibilityRole="button"
      className={`h-12 items-center justify-center rounded-lg ${className}`}
      disabled={disabled}
      onPress={onPress}>
      <Text className={`text-base font-semibold ${textClassName}`}>{label}</Text>
    </Pressable>
  );
}
