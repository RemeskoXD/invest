import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/translations';
import { Locale } from '@/lib/config';
import { GenesisApp } from '@/components/GenesisApp';

interface Props {
  params: Promise<{
    lang: string;
  }>;
}

export function generateStaticParams() {
  return [{ lang: 'cs' }, { lang: 'sk' }, { lang: 'pl' }];
}

export default async function LocalizedPage({ params }: Props) {
  const { lang } = await params;
  if (!['cs', 'sk', 'pl'].includes(lang)) {
    notFound();
  }

  const dict = getDictionary(lang as Locale);
  return <GenesisApp t={dict} />;
}