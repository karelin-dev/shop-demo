// Общие части корзины: строка товара, счётчик количества, полоса до бесплатной доставки, вещи для добора суммы
import { Link } from 'react-router'
import { products } from '../data/catalog.js'
import { FREE_FROM } from '../lib/cart.js'
import { rub } from '../lib/format.js'
import { thumbImg } from '../lib/img.js'
import { useShop } from '../shop.jsx'
import Icon from './Icon.jsx'
import s from './CartBits.module.css'

export function Stepper({ value, onChange, name, small = false }) {
  return (
    <div className={`stepper ${small ? 'small' : ''}`} role="group" aria-label={`Количество: ${name}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Меньше">
        <Icon name="minus" size={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= 99} aria-label="Больше">
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

export function Thumb({ product, option, size = 72, round = false }) {
  const photo = option?.photo !== undefined ? product.photos[option.photo] : product.photos[0]
  return (
    <img
      className={round ? s.round : s.thumb}
      src={thumbImg(photo.src)}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      loading="lazy"
      decoding="async"
    />
  )
}

export function variantText(line) {
  return line.option ? `${line.product.variants.label}: ${line.option.name}` : line.product.meta
}

export function FreeDelivery({ t, className = '' }) {
  return (
    <div className={`${s.free} ${className}`}>
      <p>
        <Icon name="truck" size={20} />
        {t.free ? (
          <span>Доставка курьером и в пункт выдачи <b>бесплатно</b></span>
        ) : (
          <span>До бесплатной доставки <b className="num">{rub(t.freeLeft)}</b></span>
        )}
      </p>
      <div
        className={s.bar}
        role="progressbar"
        aria-label="Сумма до бесплатной доставки"
        aria-valuemin={0}
        aria-valuemax={FREE_FROM}
        aria-valuenow={Math.min(t.goods, FREE_FROM)}
      >
        <i style={{ width: `${t.progress * 100}%` }} />
      </div>
    </div>
  )
}

// Недорогие вещи, которых ещё нет в корзине: сначала те, что закрывают сумму до бесплатной доставки
export function pickUpsell(cart, left, n = 3) {
  const inCart = new Set(cart.map((l) => l.slug))
  const pool = products.filter((p) => p.stock && !inCart.has(p.slug) && !p.variants && p.price <= 2500)
  const covering = pool.filter((p) => p.price >= left).sort((a, b) => a.price - b.price)
  const rest = pool.filter((p) => p.price < left).sort((a, b) => a.pop - b.pop)
  return [...covering, ...rest].slice(0, n)
}

export function Upsell({ items, onAdd }) {
  const { add } = useShop()
  return (
    <ul className={s.upsell}>
      {items.map((p) => (
        <li key={p.slug}>
          <Thumb product={p} size={52} round />
          <span className={s.upName}>
            <Link to={`/product/${p.slug}`}>{p.name}</Link>
            <span className="num">{rub(p.price)}</span>
          </span>
          <button
            type="button"
            className={s.upAdd}
            aria-label={`Добавить в корзину: ${p.name}`}
            onClick={() => {
              add({ slug: p.slug }, { open: false })
              onAdd?.(p)
            }}
          >
            <Icon name="plus" size={18} stroke={1.8} />
          </button>
        </li>
      ))}
    </ul>
  )
}
