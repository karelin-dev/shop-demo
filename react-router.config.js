import { categories, products } from './app/data/catalog.js'

// Без сервера: все страницы собираются в готовый HTML при сборке (prerender),
// а неизвестные адреса открывает запасная страница приложения (на GitHub Pages это 404.html).
export default {
  ssr: false,
  basename: '/shop-demo/',
  prerender: [
    '/',
    '/catalog',
    ...categories.map((c) => `/catalog/${c.slug}`),
    ...products.map((p) => `/product/${p.slug}`),
    '/cart',
    '/checkout',
    '/order',
    '/orders',
    '/favorites',
  ],
}
