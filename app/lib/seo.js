import { SITE } from './img.js'

const BRAND = 'Полдень'
const OG = `${SITE}og.jpg`

// Заголовок, описание, каноническая ссылка и превью для соцсетей и мессенджеров
export function seo({ title, description, path = '', image = OG, noindex = false, jsonLd = null }) {
  const full = title ? `${title} · ${BRAND}` : `${BRAND}: вещи для дома`
  // Pages отдаёт страницы по адресу со слешем на конце, его и считаем каноническим
  const clean = path.replace(/^\/|\/$/g, '')
  const url = SITE + (clean ? `${clean}/` : '')
  const tags = [
    { title: full },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: BRAND },
    { property: 'og:locale', content: 'ru_RU' },
    { property: 'og:title', content: full },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
  if (noindex) tags.push({ name: 'robots', content: 'noindex' })
  if (jsonLd) tags.push({ 'script:ld+json': jsonLd })
  return tags
}
