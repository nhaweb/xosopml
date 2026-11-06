export const formatDate = (date: Date) => new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
export const shortDate = (date: Date) => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)
export const formatMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ'
