export type PrizeRow = { label: string; value: string; count: number }
export type ProvinceResult = { name: string; code: string; rows: PrizeRow[] }

const seed = (n: number) => (n * 9301 + 49297) % 233280
const digits = (n: number, length: number) => String(seed(n)).padStart(length, '0').slice(-length)
const rows = (offset: number, north = false): PrizeRow[] => north
  ? [['G.ĐB','',1,5],['G.Nhất','',1,5],['G.Nhì','',2,5],['G.Ba','',6,5],['G.Tư','',4,4],['G.Năm','',6,4],['G.Sáu','',3,3],['G.Bảy','',4,2]].map(([label,,count,length], i) => ({ label: label as string, value: Array.from({length: count as number}, (_, j) => digits(offset+i*7+j, length as number)).join(' · '), count: count as number }))
  : [['G.Tám 100N','',1,2],['G.Bảy 200N','',1,3],['G.Sáu 400N','',3,4],['G.Năm 1Tr','',1,4],['G.Tư 3Tr','',7,5],['G.Ba 10Tr','',2,5],['G.Nhì 15Tr','',1,5],['G.Nhất 30Tr','',1,5],['G.ĐB 2Tỷ','',1,6]].map(([label,,count,length], i) => ({ label: label as string, value: Array.from({length: count as number}, (_, j) => digits(offset+i*9+j, length as number)).join(' · '), count: count as number }))

export function getResultsByDate(date = new Date()) {
  const day = date.getDate() + date.getMonth() * 31
  return {
    south: ['TP.HCM','Đồng Nai','Cần Thơ'].map((name, i) => ({ name, code: `XS${String(i+1).padStart(2,'0')}`, rows: rows(day+i*11) })),
    central: ['Đà Nẵng','Khánh Hòa'].map((name, i) => ({ name, code: `MT${String(i+1).padStart(2,'0')}`, rows: rows(day+40+i*11) })),
    north: [{ name: 'Miền Bắc', code: 'KQ', rows: rows(day+80, true) }],
    keno: Array.from({length:20}, (_, i) => (seed(day+i) % 80) + 1),
    lotto: { mega: Array.from({length:6}, (_, i) => (seed(day+i+120) % 45) + 1), power: Array.from({length:6}, (_, i) => (seed(day+i+150) % 55) + 1), lotto5: Array.from({length:5}, (_, i) => (seed(day+i+180) % 35) + 1) },
  }
}
