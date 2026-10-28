// Состояние магазина: корзина, избранное, заказы, просмотренные товары, промокод.
// Всё хранится в localStorage этого браузера. Страницы собираются заранее (prerender) без этих данных,
// поэтому читаем localStorage только после загрузки страницы: так HTML совпадает с первым рендером React.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from 'react'
import { lineKey, normalizePromo, PROMOS } from './lib/cart.js'

const KEY = 'polden:v1'
const EMPTY = { cart: [], favs: [], orders: [], recent: [], promo: null }

function reducer(state, a) {
  switch (a.type) {
    case 'load':
      return { ...state, ...a.data }
    case 'add': {
      const cart = [...state.cart]
      for (const { slug, variant, qty = 1, bundle } of a.items) {
        const key = lineKey(slug, variant)
        const i = cart.findIndex((l) => l.key === key)
        if (i >= 0) cart[i] = { ...cart[i], qty: Math.min(99, cart[i].qty + qty), bundle: bundle || cart[i].bundle }
        else cart.push({ key, slug, variant: variant || null, qty, bundle: bundle || null })
      }
      return { ...state, cart }
    }
    case 'qty':
      return { ...state, cart: state.cart.map((l) => (l.key === a.key ? { ...l, qty: Math.max(1, Math.min(99, a.qty)) } : l)) }
    case 'remove':
      return { ...state, cart: state.cart.filter((l) => l.key !== a.key) }
    case 'restore': {
      const cart = [...state.cart]
      cart.splice(Math.min(a.index, cart.length), 0, a.line)
      return { ...state, cart }
    }
    case 'fav':
      return { ...state, favs: state.favs.includes(a.slug) ? state.favs.filter((s) => s !== a.slug) : [a.slug, ...state.favs] }
    case 'promo':
      return { ...state, promo: a.code }
    case 'viewed':
      return { ...state, recent: [a.slug, ...state.recent.filter((s) => s !== a.slug)].slice(0, 8) }
    case 'order':
      return { ...state, orders: [a.order, ...state.orders], cart: [], promo: null }
    default:
      return state
  }
}

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, EMPTY)
  const [ready, setReady] = useState(false)
  const [drawer, setDrawer] = useState({ open: false, added: null })
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
      if (saved) dispatch({ type: 'load', data: saved })
    } catch {
      // повреждённые данные: начинаем с пустой корзины
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // приватный режим или нет места: магазин работает без сохранения
    }
  }, [state, ready])

  const notify = useCallback((text, action = null) => {
    clearTimeout(toastTimer.current)
    setToast({ text, action, id: Date.now() })
    toastTimer.current = setTimeout(() => setToast(null), action ? 6000 : 3500)
  }, [])

  const api = useMemo(() => ({
    add(items, { open = true } = {}) {
      const list = Array.isArray(items) ? items : [items]
      dispatch({ type: 'add', items: list })
      if (open) setDrawer({ open: true, added: list.map((i) => lineKey(i.slug, i.variant)) })
    },
    setQty: (key, qty) => dispatch({ type: 'qty', key, qty }),
    remove(key, name) {
      const index = state.cart.findIndex((l) => l.key === key)
      if (index < 0) return
      const line = state.cart[index]
      dispatch({ type: 'remove', key })
      notify(`${name} удалено из корзины`, { label: 'Вернуть', run: () => dispatch({ type: 'restore', line, index }) })
    },
    toggleFav(slug, name) {
      const was = state.favs.includes(slug)
      dispatch({ type: 'fav', slug })
      notify(was ? `${name}: убрано из избранного` : `${name}: в избранном`)
    },
    applyPromo(code) {
      const norm = normalizePromo(code)
      if (!PROMOS[norm]) return false
      dispatch({ type: 'promo', code: norm })
      return true
    },
    removePromo: () => dispatch({ type: 'promo', code: null }),
    viewed: (slug) => dispatch({ type: 'viewed', slug }),
    placeOrder(order) {
      const n = `П-${1047 + state.orders.length}`
      dispatch({ type: 'order', order: { ...order, n } })
      return n
    },
    openCart: () => setDrawer({ open: true, added: null }),
    closeCart: () => setDrawer((d) => ({ ...d, open: false })),
    notify,
    hideToast: () => setToast(null),
  }), [state, notify])

  const value = useMemo(() => ({ ...state, ready, drawer, toast, ...api }), [state, ready, drawer, toast, api])
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  return useContext(ShopContext)
}

// true после гидратации: до неё рендер должен совпасть с HTML, собранным заранее
const subscribe = () => () => {}
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
