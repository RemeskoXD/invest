import { csTranslations } from '@/lib/translations/cs';
import { GenesisApp } from '@/components/GenesisApp';

export default function HomePage() {
  return <GenesisApp t={csTranslations} />;
}