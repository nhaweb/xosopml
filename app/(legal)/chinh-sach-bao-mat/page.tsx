import React from 'react';
import { SiteFrame } from '@/components/site/site-frame';
import { ShieldCheck } from 'lucide-react';

export default function ChinhSachBaoMatPage() {
  return (
    <SiteFrame>
      <div className="mx-auto max-w-3xl rounded-3xl border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-4" /> Bảo mật thông tin
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-black text-foreground">
          Chính Sách Xử Lý Dữ Liệu Cá Nhân &amp; Bảo Mật
        </h1>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong>XSKT Minh Luân</strong> cam kết bảo vệ tuyệt đối thông tin cá nhân, số điện thoại, địa chỉ giao vé và dữ liệu đơn hàng của Quý khách.
          </p>
          <p>
            1. <strong>Thu thập thông tin:</strong> Chỉ thu thập họ tên, email, số điện thoại và địa chỉ phục vụ việc xác thực tài khoản, giao vé hỏa tốc và trả thưởng vé giữ hộ.
          </p>
          <p>
            2. <strong>Bảo mật dữ liệu:</strong> Mọi thông tin được lưu trữ an toàn và không chia sẻ cho bên thứ ba ngoài phạm vi giao nhận/đối soát trúng thưởng theo yêu cầu của khách hàng.
          </p>
          <p className="italic text-xs">
            (Nội dung chi tiết đang được cập nhật và hoàn thiện theo quy định bảo vệ dữ liệu cá nhân.)
          </p>
        </div>
      </div>
    </SiteFrame>
  );
}
