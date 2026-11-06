import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://xsktviet.vn'
  const routes = ['', '/xsmn', '/xsmt', '/xsmb', '/thong-ke', '/do-ve-so', '/in-ve-do', '/huong-dan', '/lien-he', '/chinh-sach-bao-mat', '/blog']
  return routes.map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: 'daily', priority: path === '' ? 1 : 0.7 }))
}
