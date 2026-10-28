// Копирует собранный сайт в docs/, откуда его публикует GitHub Pages.
// React Router кладёт страницы в build/client/shop-demo/, а Pages отдаёт docs/ уже по адресу /shop-demo/,
// поэтому страницы поднимаем на уровень выше.
// Запасная страница приложения становится 404.html: Pages отдаёт её на неизвестные адреса,
// приложение загружается и показывает «Такой страницы нет». Плюс sitemap.xml для поисковиков.
import { cpSync, existsSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { categories, products } from '../app/data/catalog.js'

const SITE = 'https://karelin-dev.github.io/shop-demo/'

rmSync('docs', { recursive: true, force: true })
cpSync('build/client', 'docs', { recursive: true })
cpSync('docs/shop-demo', 'docs', { recursive: true })
rmSync('docs/shop-demo', { recursive: true })
if (existsSync('docs/__spa-fallback.html')) renameSync('docs/__spa-fallback.html', 'docs/404.html')
writeFileSync('docs/.nojekyll', '')

const paths = ['', 'catalog', ...categories.map((c) => `catalog/${c.slug}`), ...products.map((p) => `product/${p.slug}`)]
const today = new Date().toISOString().slice(0, 10)
const urls = paths.map((p) => `  <url><loc>${SITE}${p ? `${p}/` : ''}</loc><lastmod>${today}</lastmod></url>`).join('\n')
writeFileSync('docs/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
console.log(`docs: готово, в sitemap ${paths.length} страниц`)
