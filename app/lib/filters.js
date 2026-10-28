// Фильтры каталога. Состояние хранится в адресе страницы (?min=&max=&mat=&color=&stock=1&sale=1&new=1&q=&sort=),
// поэтому подборку можно отправить ссылкой. Категория берётся из пути /catalog/<категория>.
import { colors, products } from '../data/catalog.js'
import { num, things } from './format.js'

export const MATERIALS = [
  ['keramika', 'Керамика'], ['farfor', 'Фарфор'], ['steklo', 'Стекло'], ['len', 'Лён'], ['hlopok', 'Хлопок'],
  ['sherst', 'Шерсть'], ['derevo', 'Дерево'], ['latun', 'Латунь'], ['vosk', 'Соевый воск'], ['rotang', 'Ротанг'],
  ['trava', 'Морская трава'], ['stal', 'Сталь'],
].map(([id, name]) => ({ id, name }))
const materialName = Object.fromEntries(MATERIALS.map((m) => [m.id, m.name]))

export const SORTS = [
  { id: 'popular', name: 'Популярные' },
  { id: 'cheap', name: 'Дешевле' },
  { id: 'expensive', name: 'Дороже' },
  { id: 'new', name: 'Новинки' },
]

export const PRICE_STEPS = [1000, 3000, 5000]

const list = (v) => (v ? v.split(',').filter(Boolean) : [])
const numOr = (v) => (v && /^\d+$/.test(v) ? Number(v) : null)

export function readFilters(params) {
  return {
    q: (params.get('q') || '').trim(),
    min: numOr(params.get('min')),
    max: numOr(params.get('max')),
    mat: list(params.get('mat')).filter((m) => materialName[m]),
    color: list(params.get('color')),
    stock: params.get('stock') === '1',
    sale: params.get('sale') === '1',
    isNew: params.get('new') === '1',
    sort: SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'popular',
  }
}

// Проверка товара; skip позволяет не учитывать одно условие (для счётчиков и подсказки)
export function matches(p, f, category, skip = '') {
  if (category && p.category !== category) return false
  if (skip !== 'q' && f.q) {
    const hay = `${p.name} ${p.meta} ${p.materials.join(' ')}`.toLowerCase().replace(/ё/g, 'е')
    if (!f.q.toLowerCase().replace(/ё/g, 'е').split(/\s+/).every((w) => hay.includes(w))) return false
  }
  if (skip !== 'price' && f.min !== null && p.price < f.min) return false
  if (skip !== 'price' && f.max !== null && p.price > f.max) return false
  if (skip !== 'mat' && f.mat.length && !f.mat.some((m) => p.materials.includes(materialName[m]))) return false
  if (skip !== 'color' && f.color.length && !f.color.some((c) => p.colors.includes(c))) return false
  if (skip !== 'stock' && f.stock && !p.stock) return false
  if (skip !== 'sale' && f.sale && !p.oldPrice) return false
  if (skip !== 'isNew' && f.isNew && !p.isNew) return false
  return true
}

const SORTERS = {
  popular: (a, b) => a.pop - b.pop,
  cheap: (a, b) => a.price - b.price,
  expensive: (a, b) => b.price - a.price,
  new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.pop - b.pop,
}

export function applyFilters(f, category) {
  return products.filter((p) => matches(p, f, category)).sort(SORTERS[f.sort])
}

// Сколько товаров даст каждый материал и цвет при остальных фильтрах
export function facets(f, category) {
  const mat = {}
  const color = {}
  for (const p of products) {
    if (matches(p, f, category, 'mat')) for (const m of MATERIALS) if (p.materials.includes(m.name)) mat[m.id] = (mat[m.id] || 0) + 1
    if (matches(p, f, category, 'color')) for (const c of p.colors) color[c] = (color[c] || 0) + 1
  }
  return { mat, color }
}

export function priceLabel(f) {
  if (f.min !== null && f.max !== null) return `${num(f.min)}–${num(f.max)} ₽`
  if (f.max !== null) return `до ${num(f.max)} ₽`
  if (f.min !== null) return `от ${num(f.min)} ₽`
  return ''
}

// Чипы активных фильтров: подпись и что убрать из адреса
export function chips(f) {
  const out = []
  if (f.q) out.push({ id: 'q', label: `«${f.q}»`, drop: { q: null } })
  if (f.min !== null || f.max !== null) out.push({ id: 'price', label: priceLabel(f), drop: { min: null, max: null } })
  for (const m of f.mat) out.push({ id: `mat-${m}`, label: materialName[m], drop: { mat: f.mat.filter((x) => x !== m).join(',') || null } })
  for (const c of f.color) {
    const name = colors.find((x) => x.id === c)?.name
    if (name) out.push({ id: `color-${c}`, label: name, drop: { color: f.color.filter((x) => x !== c).join(',') || null } })
  }
  if (f.stock) out.push({ id: 'stock', label: 'В наличии', drop: { stock: null } })
  if (f.sale) out.push({ id: 'sale', label: 'Со скидкой', drop: { sale: null } })
  if (f.isNew) out.push({ id: 'new', label: 'Новинки', drop: { new: null } })
  return out
}

// Подсказка для пустой выдачи: какое условие ослабить и сколько товаров тогда найдётся.
// Сначала пробуем поднять цену (мягче, чем сбросить фильтр), потом убрать одно условие.
export function suggestion(f, category) {
  const options = []
  if (f.max !== null) {
    const above = products.filter((p) => matches(p, f, category, 'price') && p.price > f.max && (f.min === null || p.price >= f.min))
    if (above.length) {
      const cheapest = Math.min(...above.map((p) => p.price))
      const max = Math.ceil(cheapest / 100) * 100
      const count = products.filter((p) => matches(p, { ...f, max }, category)).length
      options.push({ label: `Показать до ${num(max)} ₽ · ${things(count)}`, set: { max: String(max) }, count, prio: 1 })
    }
  }
  const drops = [
    ['q', `Искать везде · `, { q: null }],
    ['mat', 'Любой материал · ', { mat: null }],
    ['color', 'Любой цвет · ', { color: null }],
    ['stock', 'Показать и под заказ · ', { stock: null }],
    ['sale', 'Без условия «со скидкой» · ', { sale: null }],
    ['isNew', 'Не только новинки · ', { new: null }],
  ]
  for (const [key, label, set] of drops) {
    const active = key === 'mat' || key === 'color' ? f[key].length : f[key]
    if (!active) continue
    const count = products.filter((p) => matches(p, f, category, key)).length
    if (count) options.push({ label: label + things(count), set, count, prio: 0 })
  }
  options.sort((a, b) => b.prio - a.prio || b.count - a.count)
  return options[0] || null
}
