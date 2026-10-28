// Расчёт корзины: цены вариантов, скидка за комплект, промокод, доставка.
// Чистые функции без React: их легко проверить и заменить расчётом на сервере.
import { bySlug } from '../data/catalog.js'

export const FREE_FROM = 5000
export const GIFT_PRICE = 200
export const BUNDLE_DISCOUNT = 0.1
export const PROMOS = { 'ПОЛДЕНЬ10': 0.1, POLDEN10: 0.1 }

export const DELIVERY = {
  courier: { name: 'Курьером', price: 390, free: true },
  pickup: { name: 'В пункт выдачи', price: 190, free: true },
  express: { name: 'Экспресс сегодня', price: 690, free: false },
}

export const PICKUP_POINTS = [
  'м. Чистые пруды, 3 минуты пешком',
  'м. Белорусская, 5 минут пешком',
  'м. Октябрьская, 4 минуты пешком',
  'м. Сокол, 2 минуты пешком',
]

export const lineKey = (slug, variant) => `${slug}:${variant || ''}`

export function optionOf(product, variant) {
  const opts = product.variants?.options
  if (!opts) return null
  return opts.find((o) => o.id === variant) || opts[0]
}

export function priceOf(product, variant) {
  return optionOf(product, variant)?.price ?? product.price
}

export function normalizePromo(code) {
  return code.trim().toUpperCase().replace(/\s+/g, '')
}

// Комплект считается собранным, если в корзине есть все его вещи.
// Скидка 10% на одну штуку каждой вещи комплекта.
function bundleDiscount(lines) {
  const present = new Set(lines.map((l) => l.slug))
  const done = new Set()
  let sum = 0
  for (const line of lines) {
    const owner = line.bundle
    if (!owner || done.has(owner)) continue
    const set = [owner, ...(bySlug[owner]?.bundle || [])]
    if (!set.every((s) => present.has(s))) continue
    done.add(owner)
    for (const slug of set) {
      const l = lines.find((x) => x.slug === slug)
      sum += l.price * BUNDLE_DISCOUNT
    }
  }
  return Math.round(sum)
}

export function totals(cart, { promo = null, delivery = null, gift = false } = {}) {
  const lines = cart
    .map((item) => {
      const product = bySlug[item.slug]
      if (!product) return null
      const option = optionOf(product, item.variant)
      const price = option?.price ?? product.price
      return { ...item, product, option, price, sum: price * item.qty }
    })
    .filter(Boolean)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const goods = lines.reduce((s, l) => s + l.sum, 0)
  const bundle = bundleDiscount(lines)
  const rate = promo ? PROMOS[promo] || 0 : 0
  const promoSum = Math.round((goods - bundle) * rate)
  const free = goods >= FREE_FROM
  const method = delivery ? DELIVERY[delivery] : null
  const deliveryPrice = method ? (method.free && free ? 0 : method.price) : null
  const giftPrice = gift ? GIFT_PRICE : 0
  const total = goods - bundle - promoSum + (deliveryPrice || 0) + giftPrice
  return {
    lines, count, goods, bundle, promoSum, deliveryPrice, giftPrice, total,
    free, freeLeft: Math.max(0, FREE_FROM - goods), progress: Math.min(1, goods / FREE_FROM),
  }
}
