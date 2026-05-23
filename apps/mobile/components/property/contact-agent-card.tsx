import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';

export function ContactAgentCard() {
  return (
    <View className="gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <View className="gap-1">
        <Text className="text-xl font-bold text-slate-950">Interested in this property?</Text>
        <Text className="text-base text-slate-600">Contact functionality will be available in a later step.</Text>
      </View>

      <Button disabled label="Contact agent" />
    </View>
  );
}
