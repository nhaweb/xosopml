'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { SiteFrame } from '@/components/site/site-frame';
import { DREAM_ENTRIES, dreamInitial, foldVietnamese } from '@/lib/mock-dream-data';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function SoMoPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [letter, setLetter] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const availableLetters = useMemo(() => {
    return new Set(DREAM_ENTRIES.map((entry) => dreamInitial(entry.keyword)));
  }, []);

  const filtered = useMemo(() => {
    const needle = foldVietnamese(debouncedQuery.trim());
    return DREAM_ENTRIES.filter((entry) => {
      if (letter && dreamInitial(entry.keyword) !== letter) return false;
      if (!needle) return true;
      const haystack = foldVietnamese(`${entry.keyword} ${entry.meaning ?? ''} ${entry.numbers.join(' ')}`);
      return haystack.includes(needle);
    }).sort((a, b) => foldVietnamese(a.keyword).localeCompare(foldVietnamese(b.keyword), 'vi'));
  }, [debouncedQuery, letter]);

  return (
    <SiteFrame>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
          <BookOpen className="size-4" />
          Sổ mơ lô đề
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Tra cứu giấc mơ</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {DREAM_ENTRIES.length} giấc mơ phổ biến, kèm các cặp số thường được người chơi đối chiếu. Nội dung chỉ để tham khảo.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border bg-card p-4 shadow-sm">
        <label className="relative block">
          <span className="sr-only">Tìm giấc mơ</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Gõ rắn, cháy nhà, 18..."
            className="w-full rounded-xl border bg-background py-2.5 pr-3 pl-9 text-sm outline-none ring-red-600/30 focus:ring-2"
          />
        </label>

        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo chữ cái">
          <button
            type="button"
            onClick={() => setLetter(null)}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              letter === null ? 'bg-red-600 text-white' : 'bg-muted/70 hover:bg-muted'
            }`}
          >
            Tất cả
          </button>
          {LETTERS.map((item) => {
            const enabled = availableLetters.has(item);
            const active = letter === item;
            return (
              <button
                key={item}
                type="button"
                disabled={!enabled}
                onClick={() => setLetter(active ? null : item)}
                className={`size-8 rounded-lg text-xs font-bold ${
                  active
                    ? 'bg-red-600 text-white'
                    : enabled
                      ? 'bg-muted/70 hover:bg-muted'
                      : 'cursor-not-allowed bg-muted/30 text-muted-foreground/40'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
          <span className="font-semibold">{filtered.length} giấc mơ</span>
          {debouncedQuery ? <span className="text-muted-foreground">Từ khóa: {debouncedQuery}</span> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                <th className="px-4 py-3 font-bold">Giấc mơ</th>
                <th className="px-4 py-3 font-bold">Cặp số</th>
                <th className="px-4 py-3 font-bold">Diễn giải</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                    Không có giấc mơ khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-bold">{entry.keyword}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {entry.numbers.map((number) => (
                          <span
                            key={number}
                            className="rounded-md bg-red-500/10 px-2 py-0.5 font-black text-red-600 tabular-nums dark:text-red-400"
                          >
                            {number}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.meaning}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SiteFrame>
  );
}
