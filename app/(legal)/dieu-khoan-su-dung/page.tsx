import React from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { FileText } from 'lucide-react';

export default function DieuKhoanSuDungPage() {
  return (
    <SiteFrame>
      <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-red-600 dark:text-red-400">
          <FileText className="size-4" /> Quy định &amp; Pháp lý
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
          Điều Khoản Sử Dụng — XSKT Minh Luân
        </h1>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Chào mừng Quý khách đến với hệ thống tra cứu kết quả xổ số kiến thiết và dịch vụ mua vé số trực tuyến của <strong>XSKT Minh Luân</strong>.
          </p>
          <p>
            1. <strong>Phạm vi dịch vụ:</strong> Cung cấp thông tin kết quả xổ số 3 miền, tiện ích thống kê tham khảo và dịch vụ đặt mua/giữ hộ vé số kiến thiết hợp pháp.
          </p>
          <p>
            2. <strong>Trách nhiệm người dùng:</strong> Người dùng cam kết đủ 18 tuổi trở lên và tự chịu trách nhiệm đối chiếu với bảng kết quả chính thức của Công ty XSKT phát hành.
          </p>
          <p className="italic text-xs">
            (Nội dung chi tiết đang được cập nhật và hoàn thiện theo quy định hiện hành.)
          </p>
        </div>
      </div>
    </SiteFrame>
  );
}
