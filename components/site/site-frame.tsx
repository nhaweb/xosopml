'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MinhLuanHeader } from '@/components/minhluan/minhluan-header';
import { TicketCheckerModal } from '@/components/lottery/ticket-checker-modal';
import { SiteFooter } from './site-footer';
import { getLotteryResults } from '@/lib/mock-lottery-data';
import { audioSynth } from '@/lib/audio-synthesizer';
import { formatDate } from '@/lib/format';
import { toRouteDate } from '@/lib/lottery-date';

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [checkerOpen, setCheckerOpen] = useState(false);

  const todayData = useMemo(() => getLotteryResults(new Date()), []);
  const allProvinces = useMemo(
    () => [...todayData.south, ...todayData.central, ...todayData.north],
    [todayData]
  );
  const activeDateStr = useMemo(() => formatDate(new Date()), []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('minhluan_theme');
      const isDark = saved === 'dark';
      setDark(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } catch {
      // ignore
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem('minhluan_theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
    } catch {
      // ignore
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audioSynth.enabled = nextState;
    if (nextState) {
      audioSynth.playDrawChime();
    }
  };

  const handleSelectRegionTab = (tab: 'all' | 'south' | 'central' | 'north' | 'vietlott') => {
    if (tab === 'all') router.push('/');
    else if (tab === 'south') router.push('/#xsmn');
    else if (tab === 'central') router.push('/#xsmt');
    else if (tab === 'north') router.push('/#xsmb');
    else router.push('/#vietlott');
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${dark ? 'dark' : ''}`}>
      <MinhLuanHeader
        activeDateStr={activeDateStr}
        activeDate={new Date()}
        onSelectDate={(d) => router.push('/ngay/' + toRouteDate(d))}
        allProvinces={allProvinces}
        activeRegionTab="all"
        onSelectRegionTab={handleSelectRegionTab}
        dark={dark}
        onToggleDark={toggleDark}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenCheckerModal={() => setCheckerOpen(true)}
      />

      <main className="mx-auto max-w-[1260px] px-4 py-6 lg:px-6">{children}</main>

      <TicketCheckerModal
        isOpen={checkerOpen}
        onClose={() => setCheckerOpen(false)}
        availableResults={allProvinces}
      />

      <SiteFooter />
    </div>
  );
}
