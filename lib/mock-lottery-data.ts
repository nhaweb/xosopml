/**
 * Dữ liệu mẫu cũ đã được tách sang `lib/fallback-lottery-data.ts` để làm dữ liệu dự phòng (fallback).
 * Mọi luồng dữ liệu chính thức hiện được lấy qua Server-side Service `lib/services/xosoApi.ts`
 * kết nối trực tiếp tới hệ thống `xosoapi.online`.
 */
export { getFallbackLotteryResults as getLotteryResults } from '@/lib/fallback-lottery-data';
