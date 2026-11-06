import { ProvinceDrawResult } from '@/types/lottery';

export interface TicketMatchResult {
  isWinner: boolean;
  prizeName?: string;
  rewardAmount?: string;
  matchedNumber?: string;
  details: string;
}

/**
 * Kiểm tra xem 1 dãy số vé có trúng giải nào trong kết quả quay thưởng hay không
 * @param ticketNumber Dãy số trên tờ vé (thường là 5 số với Miền Bắc, 6 số với Nam/Trung)
 * @param result Kết quả xổ số của tỉnh/đài đó
 */
export function checkTicket(ticketNumber: string, result: ProvinceDrawResult): TicketMatchResult {
  const cleanTicket = ticketNumber.trim().replace(/\D/g, '');
  if (!cleanTicket || cleanTicket.length < 2) {
    return {
      isWinner: false,
      details: 'Vui lòng nhập đầy đủ ít nhất 2 chữ số trên vé.',
    };
  }

  // Tìm giải Đặc Biệt trước
  const specialPrize = result.prizes.find(
    (p) => p.prizeName.includes('Đặc Biệt') || p.prizeName.includes('G.ĐB')
  );
  const specialNumber = specialPrize?.numbers[0];

  // 1. Kiểm tra trúng Giải Đặc Biệt
  if (specialNumber && cleanTicket === specialNumber) {
    return {
      isWinner: true,
      prizeName: specialPrize.prizeName,
      rewardAmount: specialPrize.rewardAmount || 'Giải thưởng cực lớn',
      matchedNumber: specialNumber,
      details: `Chúc mừng! Vé ${cleanTicket} trúng Giải Đặc Biệt!`,
    };
  }

  // 2. Kiểm tra Giải Phụ Đặc Biệt (XSMN / XSMT: Trúng 5 số cuối liên tiếp của Giải ĐB 6 chữ số)
  if (specialNumber && specialNumber.length === 6 && cleanTicket.length === 6) {
    const last5Special = specialNumber.slice(1);
    const last5Ticket = cleanTicket.slice(1);
    if (last5Special === last5Ticket && cleanTicket[0] !== specialNumber[0]) {
      return {
        isWinner: true,
        prizeName: 'Giải Phụ Đặc Biệt',
        rewardAmount: '50.000.000 đ',
        matchedNumber: specialNumber,
        details: `Trúng 5 số cuối của Giải Đặc Biệt (${last5Special}).`,
      };
    }

    // 3. Kiểm tra Giải Khuyến Khích (Sai 1 chữ số bất kỳ ở các vị trí còn lại so với G.ĐB)
    let diffCount = 0;
    for (let i = 0; i < 6; i++) {
      if (cleanTicket[i] !== specialNumber[i]) diffCount++;
    }
    if (diffCount === 1 && cleanTicket[0] === specialNumber[0]) {
      return {
        isWinner: true,
        prizeName: 'Giải Khuyến Khích',
        rewardAmount: '6.000.000 đ',
        matchedNumber: specialNumber,
        details: `Sai duy nhất 1 số so với Giải Đặc Biệt (${specialNumber}).`,
      };
    }
  }

  // 4. Đối chiếu từ các giải cao đến giải thấp theo đuôi số
  for (const prize of result.prizes) {
    if (prize === specialPrize) continue;

    for (const winningNum of prize.numbers) {
      const matchLen = winningNum.length;
      // Lấy đuôi số của vé tương ứng với độ dài số giải thưởng
      if (cleanTicket.length >= matchLen) {
        const ticketTail = cleanTicket.slice(-matchLen);
        if (ticketTail === winningNum) {
          return {
            isWinner: true,
            prizeName: prize.prizeName,
            rewardAmount: prize.rewardAmount || 'Theo quy định phát hành',
            matchedNumber: winningNum,
            details: `Trúng đuôi ${matchLen} số (${winningNum}) của ${prize.prizeName}.`,
          };
        }
      }
    }
  }

  return {
    isWinner: false,
    details: `Rất tiếc! Vé số ${cleanTicket} không trúng giải nào của đài ${result.provinceName}. Chúc bạn may mắn lần sau!`,
  };
}

