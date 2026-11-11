'use client';

import React, { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/translations';
import { InvestmentTier } from '@/lib/config';
import { OrderRecord } from '@/lib/validations';

import { DeepfakeBanner } from '@/components/layout/DeepfakeBanner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { GrowthChart } from '@/components/sections/GrowthChart';
import { InvestPillars } from '@/components/sections/InvestPillars';
import { Calculator } from '@/components/sections/Calculator';
import { VipSection } from '@/components/sections/VipSection';
import { Scorecard } from '@/components/sections/Scorecard';
import { Contact } from '@/components/sections/Contact';
import { InvestModal } from '@/components/modal/InvestModal';
import { QrModal } from '@/components/modal/QrModal';
import { GoldDust } from '@/components/ui/GoldDust';
import { ReadingProgress } from '@/components/ui/ReadingProgress';
import { BackToTop } from '@/components/ui/BackToTop';

interface Props {
  t: Dictionary;
}

export const GenesisApp: React.FC<Props> = ({ t }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTier, setModalTier] = useState<InvestmentTier>('standard');
  const [modalAmount, setModalAmount] = useState<number | undefined>(undefined);
  const [modalYears, setModalYears] = useState<number | undefined>(undefined);

  const [qrOpen, setQrOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderRecord | null>(null);

  const [dustTrigger, setDustTrigger] = useState(false);

  // Scroll reveal observer
  useEffect(() => {
    const revealEls = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-delay-1, .reveal-delay-2, .reveal-delay-3'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleOpenModal = (
    tier: InvestmentTier = 'standard',
    amount?: number,
    years?: number
  ) => {
    setModalTier(tier);
    setModalAmount(amount);
    setModalYears(years);
    setModalOpen(true);
  };

  const handleOrderSuccess = (order: OrderRecord) => {
    setCurrentOrder(order);
    setQrOpen(true);
  };

  const handleTriggerDust = () => {
    setDustTrigger(true);
    setTimeout(() => setDustTrigger(false), 2600);
  };

  return (
    <>
      <ReadingProgress />
      <DeepfakeBanner t={t} />
      <Navbar t={t} />

      <main id="main-content">
        <Hero t={t} onOpenModal={() => handleOpenModal('standard')} />
        <About t={t} />
        <GrowthChart t={t} />
        <InvestPillars t={t} onOpenModal={(tier) => handleOpenModal(tier || 'standard')} />
        <Calculator
          t={t}
          onOpenModal={handleOpenModal}
          onTriggerDust={handleTriggerDust}
        />
        <VipSection t={t} onOpenModal={handleOpenModal} />
        <Scorecard t={t} />
        <Contact t={t} />
      </main>

      <Footer t={t} />

      <InvestModal
        t={t}
        isOpen={modalOpen}
        initialTier={modalTier}
        initialAmount={modalAmount}
        initialYears={modalYears}
        onClose={() => setModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      <QrModal
        order={currentOrder}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />

      <GoldDust trigger={dustTrigger} />
      <BackToTop />
    </>
  );
};