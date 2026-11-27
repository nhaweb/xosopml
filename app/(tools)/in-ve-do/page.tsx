'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { getFallbackLotteryResults } from '@/lib/fallback-lottery-data';
import { ApiDataSourceBanner, LotteryBoardSkeleton } from '@/components/lottery/lottery-board-skeleton';
import { resolveProvinceCode, sortProvincesCanonical } from '@/config/lottery-provinces';
import { siteConfig } from '@/config/site';
import { Printer } from 'lucide-react';
import { DayLotteryData, ProvinceDrawResult } from '@/types/lottery';

const SHORT_WEEKDAYS = ['C.Nhật', 'T.Hai', 'T.Ba', 'T.Tư', 'T.Năm', 'T.Sáu', 'T.Bảy'];
const FULL_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function normalizePrizeShortLabel(name: string, isNorth = false): string {
  if (name.includes('Đặc Biệt') || name.includes('G.ĐB')) return isNorth ? 'Giải Đặc Biệt' : 'ĐB';
  if (name.includes('G.Tám')) return 'Giải 8';
  if (name.includes('G.Bảy')) return isNorth ? 'Giải bảy' : 'Giải 7';
  if (name.includes('G.Sáu')) return isNorth ? 'Giải sáu' : 'Giải 6';
  if (name.includes('G.Năm')) return isNorth ? 'Giải năm' : 'Giải 5';
  if (name.includes('G.Tư')) return isNorth ? 'Giải tư' : 'Giải 4';
  if (name.includes('G.Ba')) return isNorth ? 'Giải ba' : 'Giải 3';
  if (name.includes('G.Nhì')) return isNorth ? 'Giải nhì' : 'Giải 2';
  if (name.includes('G.Nhất')) return isNorth ? 'Giải nhất' : 'Giải 1';
  return name;
}

/**
 * Mẫu in vé dò Miền Bắc chuẩn format Minh Ngọc (Giải ĐB trên cùng -> Giải bảy dưới cùng)
 */
function NorthPrintTicket({
  province,
  fullWeekday,
  fullDateStr,
  compactMode,
}: {
  province: ProvinceDrawResult;
  fullWeekday: string;
  fullDateStr: string;
  compactMode: boolean;
}) {
  return (
    <div className="print-ticket-sheet border-2 border-black bg-white text-black shadow-lg print:shadow-none">
      {/* Header chuẩn vé dò Miền Bắc Minh Ngọc */}
      <div className="border-b-2 border-black px-3 py-2 text-center bg-white text-black">
        <div className={`${compactMode ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold uppercase tracking-wide`}>
          CÔNG TY XỔ SỐ KIẾN THIẾT THỦ ĐÔ
        </div>
        <h2 className={`${compactMode ? 'text-base' : 'text-xl sm:text-2xl'} mt-0.5 font-black uppercase tracking-wide leading-tight`}>
          KẾT QUẢ XỔ SỐ MIỀN BẮC
        </h2>
        <div className={`${compactMode ? 'text-[10px]' : 'text-xs sm:text-sm'} mt-0.5 font-medium`}>
          Mở thưởng ngày <strong className="font-black">{fullWeekday}</strong>{' '}
          <span className="font-black">{fullDateStr}</span>
        </div>
      </div>

      {/* Bảng giải Miền Bắc: Giải Đặc Biệt trên cùng -> Giải bảy dưới cùng */}
      <table className="print-ticket-table w-full border-collapse text-center text-black">
        <tbody>
          {province.prizes.map((prize) => {
            const label = normalizePrizeShortLabel(prize.prizeName, true);
            const isSpecial = label === 'Giải Đặc Biệt';
            const isSeventh = label === 'Giải bảy';
            const nums = prize.numbers || [];
            const count = nums.length;

            let gridClass = 'flex items-center justify-center';
            if (count === 2) gridClass = 'grid grid-cols-2 gap-x-2 items-center justify-items-center';
            else if (count === 3) gridClass = 'grid grid-cols-3 gap-x-1 items-center justify-items-center';
            else if (count === 4) gridClass = 'grid grid-cols-4 gap-x-1 items-center justify-items-center';
            else if (count === 6) gridClass = 'grid grid-cols-3 gap-x-1 gap-y-0.5 items-center justify-items-center';

            return (
              <tr key={prize.prizeName} className="border-b border-black last:border-b-0 bg-white">
                <th
                  scope="row"
                  className={`${
                    compactMode ? 'w-[62px] text-[10px] py-1' : 'w-[86px] sm:w-[96px] text-xs sm:text-sm py-1.5'
                  } border-r border-black px-1 text-center align-middle font-bold leading-tight text-black`}
                >
                  {isSpecial ? (
                    <span className="font-black">
                      Giải
                      <br />
                      Đặc Biệt
                    </span>
                  ) : (
                    <span>{label}</span>
                  )}
                </th>
                <td
                  className={`${
                    compactMode ? 'px-1 py-1' : 'px-2 py-1.5'
                  } text-center align-middle font-mono tabular-nums text-black`}
                >
                  <div className={gridClass}>
                    {nums.map((num, nIdx) => (
                      <span
                        key={nIdx}
                        className={`block whitespace-nowrap leading-tight text-black ${
                          isSpecial
                            ? compactMode
                              ? 'text-2xl font-black tracking-wider'
                              : 'text-3xl sm:text-4xl font-black tracking-wider'
                            : isSeventh
                            ? compactMode
                              ? 'text-lg font-black'
                              : 'text-2xl sm:text-3xl font-black'
                            : compactMode
                            ? 'text-sm font-bold'
                            : 'text-lg sm:text-2xl font-bold'
                        }`}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Chân trang chuẩn Miền Bắc Minh Ngọc (giữ nguyên thông tin Minh Luân) */}
      <div className="border-t border-black bg-white px-2 py-1 text-center text-black space-y-0.5">
        <div className={`${compactMode ? 'text-[9px]' : 'text-[11px]'} font-semibold`}>
          Các đại lý cần so lại fax biên bản kết quả xổ số của Công Ty
        </div>
        <div className={`${compactMode ? 'text-[9px]' : 'text-[11px]'} italic`}>
          Tường thuật trực tiếp từng giải, in kết quả tại: www.xosominhluan.vn
        </div>
      </div>
      <div
        className={`print-black-bar flex flex-wrap items-center justify-between gap-1 bg-black px-2.5 py-1 text-white font-bold ${
          compactMode ? 'text-[9px]' : 'text-[11px] sm:text-xs'
        }`}
      >
        <span>Đổi số trúng tận nơi: {siteConfig.hotline}</span>
        <span>Kính Chúc Quý Khách May Mắn Phát Tài!..</span>
      </div>
    </div>
  );
}

/**
 * Mẫu in vé dò Miền Nam & Miền Trung chuẩn format Minh Ngọc (Giải 8 trên cùng -> ĐB dưới cùng)
 */
function SouthCentralPrintTicket({
  regionTitle,
  provinces,
  shortWeekday,
  dayMonthStr,
  yearSpacedStr,
  compactMode,
}: {
  regionTitle: string;
  provinces: ProvinceDrawResult[];
  shortWeekday: string;
  dayMonthStr: string;
  yearSpacedStr: string;
  compactMode: boolean;
}) {
  const isFourCol = provinces.length >= 4;
  const prizeTplList = provinces[0]?.prizes || [];

  return (
    <div className="print-ticket-sheet border-2 border-black bg-white text-black shadow-lg print:shadow-none">
      {/* Thanh tiêu đề đen trên cùng chuẩn vé dò Minh Ngọc */}
      <div className="print-black-bar flex items-center justify-between bg-black px-3 py-1.5 text-white">
        <div className="text-left">
          <h2
            className={`${
              compactMode ? 'text-sm' : 'text-lg sm:text-2xl'
            } font-black uppercase tracking-wide leading-tight text-white`}
          >
            KẾT QUẢ XỔ SỐ {regionTitle}
          </h2>
          <p className={`${compactMode ? 'text-[9px]' : 'text-[11px] sm:text-xs'} italic text-white/90`}>
            Tường thuật trực tiếp tại: www.xosominhluan.vn
          </p>
        </div>
        <div className="shrink-0 pl-2 text-center leading-none">
          <div
            className={`border-b-2 border-white pb-0.5 font-black tracking-tight text-white ${
              compactMode ? 'text-base' : 'text-xl sm:text-2xl'
            }`}
          >
            {dayMonthStr}
          </div>
          <div
            className={`pt-0.5 font-black tracking-widest text-white ${
              compactMode ? 'text-[9px]' : 'text-xs sm:text-sm'
            }`}
          >
            {yearSpacedStr}
          </div>
        </div>
      </div>

      {/* Thanh lưu ý đại lý */}
      <div
        className={`print-sub-bar border-b border-black bg-neutral-700 px-2 py-0.5 text-center font-bold text-white ${
          compactMode ? 'text-[9px]' : 'text-[11px]'
        }`}
      >
        Các đại lý cần so lại fax biên bản kết quả xổ số của Công Ty
      </div>

      {/* Bảng vé dò chuẩn: viền đen sắc nét 1px solid #000, mỗi lô số 1 dòng duy nhất */}
      <div className="overflow-x-auto print:overflow-visible">
        <table className="print-ticket-table w-full table-fixed border-collapse text-center text-black">
          <thead>
            <tr className="border-b border-black bg-white">
              <th
                className={`${
                  compactMode ? 'w-[52px]' : 'w-[74px] sm:w-[86px]'
                } border-r border-black px-1 py-1 text-center align-middle`}
              >
                <div className={`${compactMode ? 'text-[10px]' : 'text-xs sm:text-sm'} font-black leading-tight text-black`}>
                  {shortWeekday}
                </div>
                <div
                  className={`mt-0.5 border-t border-black pt-0.5 font-black text-black ${
                    compactMode ? 'text-[10px]' : 'text-xs'
                  }`}
                >
                  {dayMonthStr}
                </div>
              </th>
              {provinces.map((p) => {
                const code = resolveProvinceCode(p.provinceName, undefined, p.provinceId, p.provinceCode);
                return (
                  <th
                    key={p.provinceId || p.provinceCode}
                    className="border-r last:border-r-0 border-black px-1 py-1 text-center align-middle"
                  >
                    <div
                      className={`${
                        compactMode ? 'text-[11px]' : 'text-sm sm:text-base'
                      } font-black leading-tight text-black whitespace-nowrap`}
                    >
                      {p.provinceName}
                    </div>
                    <div
                      className={`mt-0.5 border-t border-black pt-0.5 font-bold text-black ${
                        compactMode ? 'text-[9px]' : 'text-[11px]'
                      }`}
                    >
                      {code}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {prizeTplList.map((prizeTpl, pIdx) => {
              const shortLabel = normalizePrizeShortLabel(prizeTpl.prizeName, false);
              const isSpecial = shortLabel === 'ĐB';
              const isEighth = shortLabel === 'Giải 8';
              const isFourth = shortLabel === 'Giải 4';

              return (
                <tr key={prizeTpl.prizeName} className="border-b border-black last:border-b-0 bg-white">
                  {/* Cột tên giải bên trái */}
                  <th
                    scope="row"
                    className={`border-r border-black px-1 py-0.5 text-center align-middle text-black ${
                      isSpecial
                        ? compactMode
                          ? 'text-base font-black'
                          : 'text-xl sm:text-2xl font-black'
                        : compactMode
                        ? 'text-[10px] font-bold'
                        : 'text-xs sm:text-sm font-bold'
                    }`}
                  >
                    {isFourth ? (
                      <div className="flex flex-col items-center justify-between gap-1.5 py-0.5">
                        <span className={`${compactMode ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold leading-none`}>
                          Giải 4
                        </span>
                        <div
                          className={`${
                            compactMode ? 'text-[8px]' : 'text-[10px] sm:text-[11px]'
                          } font-black leading-tight tracking-tight text-black`}
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          Đổi số trúng tận nơi · {siteConfig.hotline}
                        </div>
                      </div>
                    ) : (
                      <span>{shortLabel}</span>
                    )}
                  </th>

                  {/* Cột các dãy số từng đài — mỗi lô số gọn 1 dòng duy nhất (whitespace-nowrap) */}
                  {provinces.map((prov) => {
                    const rowNumbers = prov.prizes[pIdx]?.numbers || [];
                    return (
                      <td
                        key={prov.provinceId || prov.provinceCode}
                        className="border-r last:border-r-0 border-black px-0.5 py-0.5 text-center align-middle font-mono tabular-nums text-black"
                      >
                        <div className="flex flex-col items-center justify-center">
                          {rowNumbers.map((num, nIdx) => (
                            <span
                              key={nIdx}
                              className={`block whitespace-nowrap leading-tight text-black ${
                                isEighth
                                  ? compactMode
                                    ? 'text-xl font-black'
                                    : isFourCol
                                    ? 'text-[27px] sm:text-[33px] font-black py-0.5'
                                    : 'text-[33px] sm:text-[40px] font-black py-0.5'
                                  : isSpecial
                                  ? compactMode
                                    ? 'text-base font-black tracking-tight py-0.5'
                                    : isFourCol
                                    ? 'text-lg sm:text-2xl font-black tracking-tight py-1'
                                    : 'text-xl sm:text-3xl font-black tracking-tight py-1'
                                  : compactMode
                                  ? 'text-xs font-bold'
                                  : isFourCol
                                  ? 'text-base sm:text-lg font-bold py-[1px]'
                                  : 'text-lg sm:text-2xl font-bold py-[1px]'
                              }`}
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Thanh chân trang đen chuẩn vé dò Minh Ngọc */}
      <div
        className={`print-black-bar flex flex-wrap items-center justify-between gap-1 bg-black px-2.5 py-1 font-bold text-white ${
          compactMode ? 'text-[9px]' : 'text-[11px] sm:text-xs'
        }`}
      >
        <span>Đổi vé số trúng Đặc Biệt tận nơi: {siteConfig.hotline}</span>
        <span>www.xosominhluan.vn</span>
      </div>
    </div>
  );
}

export default function InVeDoPage() {
  const [selectedRegion, setSelectedRegion] = useState<'south' | 'central' | 'north'>('south');
  const [dayOffset, setDayOffset] = useState(0);
  const [sheetsPerPage, setSheetsPerPage] = useState<1 | 4>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [apiMeta, setApiMeta] = useState<{
    source: 'xosoapi.online' | 'fallback';
    warning?: string;
    isLiveWindow?: boolean;
    revalidateSeconds?: number;
  }>({ source: 'xosoapi.online', revalidateSeconds: 3600 });

  const activeDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    return d;
  }, [dayOffset]);

  const [lotteryData, setLotteryData] = useState<DayLotteryData>(() =>
    getFallbackLotteryResults(new Date())
  );

  const loadDraw = useCallback(async (targetDate: Date) => {
    setIsLoading(true);
    const iso = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    try {
      const res = await fetch(`/api/xoso/draws?date=${iso}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setLotteryData(json.data);
          setApiMeta({
            source: json.source || 'fallback',
            warning: json.warning,
            isLiveWindow: json.isLiveWindow,
            revalidateSeconds: json.revalidateSeconds,
          });
          return;
        }
      }
      setLotteryData(getFallbackLotteryResults(targetDate));
    } catch {
      setLotteryData(getFallbackLotteryResults(targetDate));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDraw(activeDate);
  }, [activeDate, loadDraw]);

  const currentProvinces = useMemo(() => {
    if (selectedRegion === 'south') return sortProvincesCanonical(lotteryData.south);
    if (selectedRegion === 'central') return sortProvincesCanonical(lotteryData.central);
    return sortProvincesCanonical(lotteryData.north);
  }, [lotteryData, selectedRegion]);

  const displayDateObj = useMemo(() => {
    if (lotteryData?.date) {
      const parsed = new Date(lotteryData.date);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return activeDate;
  }, [lotteryData?.date, activeDate]);

  const dayMonthStr = `${String(displayDateObj.getDate()).padStart(2, '0')}/${String(
    displayDateObj.getMonth() + 1
  ).padStart(2, '0')}`;
  const fullDateStr = `${dayMonthStr}/${displayDateObj.getFullYear()}`;
  const yearSpacedStr = String(displayDateObj.getFullYear()).split('').join(' ');
  const shortWeekday = SHORT_WEEKDAYS[displayDateObj.getDay()];
  const fullWeekday = FULL_WEEKDAYS[displayDateObj.getDay()];

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const regionTitle =
    selectedRegion === 'south'
      ? 'MIỀN NAM'
      : selectedRegion === 'central'
      ? 'MIỀN TRUNG'
      : 'MIỀN BẮC';

  const renderSingleTicket = (compactMode: boolean) => {
    if (selectedRegion === 'north') {
      const northProv = currentProvinces[0];
      if (!northProv) return null;
      return (
        <NorthPrintTicket
          province={northProv}
          fullWeekday={fullWeekday}
          fullDateStr={fullDateStr}
          compactMode={compactMode}
        />
      );
    }
    return (
      <SouthCentralPrintTicket
        regionTitle={regionTitle}
        provinces={currentProvinces}
        shortWeekday={shortWeekday}
        dayMonthStr={dayMonthStr}
        yearSpacedStr={yearSpacedStr}
        compactMode={compactMode}
      />
    );
  };

  return (
    <SiteFrame>
      {/* Controls Bar - Hidden on print */}
      <div className="no-print print:hidden mb-6 rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <Printer className="size-4" />
              Công Cụ Đại Lý Vé Số
            </div>
            <h1 className="mt-1 text-2xl font-black text-foreground">In Vé Dò Chuẩn Minh Ngọc (A4)</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Mẫu in chuẩn riêng cho Miền Nam, Miền Trung và Miền Bắc — sắc nét đen thuần, dãy số 1 dòng không rớt hàng.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-md hover:bg-red-700 transition-all hover:scale-105"
          >
            <Printer className="size-5" /> In Vé Dò Ngay (Ctrl + P)
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Chọn Miền In Vé Dò
            </label>
            <div className="flex gap-1.5">
              {[
                { id: 'south', label: 'Miền Nam' },
                { id: 'central', label: 'Miền Trung' },
                { id: 'north', label: 'Miền Bắc' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRegion(r.id as 'south' | 'central' | 'north')}
                  className={`flex-1 rounded-xl px-2.5 py-2 text-xs font-bold border transition-all ${
                    selectedRegion === r.id
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Chọn Ngày Xem
            </label>
            <div className="flex gap-1.5">
              {[
                { offset: 0, label: 'Hôm nay' },
                { offset: 1, label: 'Hôm qua' },
                { offset: 2, label: '2 ngày' },
                { offset: 3, label: '3 ngày' },
              ].map((d) => (
                <button
                  key={d.offset}
                  type="button"
                  onClick={() => setDayOffset(d.offset)}
                  className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold border transition-all ${
                    dayOffset === d.offset
                      ? 'bg-foreground text-background border-foreground shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">
              Bố Cục Trang In A4
            </label>
            <div className="flex gap-1.5">
              {[
                { count: 1 as const, label: '1 bảng / A4' },
                { count: 4 as const, label: '4 bảng / A4 (2×2)' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setSheetsPerPage(opt.count)}
                  className={`flex-1 rounded-xl px-2.5 py-2 text-xs font-bold border transition-all ${
                    sheetsPerPage === opt.count
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="no-print print:hidden">
        <ApiDataSourceBanner
          source={apiMeta.source}
          warning={apiMeta.warning}
          isLiveWindow={apiMeta.isLiveWindow}
          revalidateSeconds={apiMeta.revalidateSeconds}
          isLoading={isLoading}
          onRefresh={() => loadDraw(activeDate)}
        />
      </div>

      {/* Printable Sheet */}
      {isLoading ? (
        <LotteryBoardSkeleton count={1} />
      ) : sheetsPerPage === 4 ? (
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 print:max-w-none print:grid-cols-2 print:gap-2">
          {[0, 1, 2, 3].map((copyIdx) => (
            <div key={copyIdx}>{renderSingleTicket(true)}</div>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-[680px] print:max-w-none print:w-full">
          {renderSingleTicket(false)}
        </div>
      )}
    </SiteFrame>
  );
}
