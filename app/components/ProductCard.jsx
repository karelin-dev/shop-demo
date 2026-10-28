import { useState } from 'react'
import { Link } from 'react-router'
import { rub } from '../lib/format.js'
import { productImg } from '../lib/img.js'
import { useShop } from '../shop.jsx'
import Icon from './Icon.jsx'
import s from './ProductCard.module.css'

const SIZES = '(max-width: 767px) 50vw, (max-width: 1099px) 33vw, 340px'

export function Badge({ product: p, className }) {
  if (!p.stock) return null
  let text = null
  let kind = ''
  if (p.oldPrice) {
    text = `−${Math.round((1 - p.price / p.oldPrice) * 100)}%`
    kind = s.sale
  } else if (p.isNew) text = 'новое'
  else if (p.hit) {
    text = 'хит'
    kind = s.hit
  }
  return text ? <span className={`sticker ${s.badge} ${kind} ${className || ''}`}>{text}</span> : null
}

export function PriceFrom({ product: p }) {
  const prices = p.variants ? p.variants.options.map((o) => o.price) : [p.price]
  const min = Math.min(...prices)
  const from = prices.some((x) => x !== min)
  return (
    <span className="price">
      {from ? 'от ' : ''}{rub(min)}
      {p.oldPrice && <s className="old-price"><span className="visually-hidden">без скидки </span>{rub(p.oldPrice)}</s>}
    </span>
  )
}

export default function ProductCard({ product: p, sizes = SIZES, priority = false }) {
  const { favs, toggleFav, add } = useShop()
  const fav = favs.includes(p.slug)
  // второе фото показываем при наведении и грузим только после первого наведения
  const [peek, setPeek] = useState(false)
  const second = peek && p.photos[1] && p.variants?.type !== 'color' ? p.photos[1] : null
  const url = `/product/${p.slug}`
  const colorOptions = p.variants?.type === 'color' ? p.variants.options : null

  return (
    <article className={s.card} onPointerEnter={(e) => e.pointerType === 'mouse' && setPeek(true)}>
      <div className={s.photo}>
        <img
          {...productImg(p.photos[0].src, sizes)}
          alt=""
          width="800"
          height="800"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
        />
        {second && <img className={s.second} {...productImg(second.src, sizes)} alt="" width="800" height="800" loading="lazy" decoding="async" />}
        {!p.stock && <span className={s.out}>Нет в наличии</span>}
      </div>
      <Badge product={p} />
      <button
        type="button"
        className={`${s.fav} ${fav ? s.favOn : ''}`}
        aria-pressed={fav}
        aria-label={`В избранное: ${p.name}`}
        onClick={() => toggleFav(p.slug, p.name)}
      >
        <Icon name="heart" size={20} fill={fav ? 'currentColor' : 'none'} />
      </button>
      <div className={s.body}>
        <h3 className={s.name}><Link to={url}>{p.name}</Link></h3>
        <p className={s.meta}>{p.meta}</p>
        <div className={s.row}>
          <PriceFrom product={p} />
          {colorOptions && (
            <span className={s.swatches} role="img" aria-label={`Цвета: ${colorOptions.map((o) => o.name).join(', ')}`}>
              {colorOptions.map((o) => <i key={o.id} style={{ background: o.hex }} />)}
            </span>
          )}
          <button
            type="button"
            className={s.add}
            disabled={!p.stock}
            aria-label={p.stock ? `В корзину: ${p.name}` : `${p.name}: нет в наличии`}
            onClick={() => add({ slug: p.slug, variant: p.variants?.options[0].id })}
          >
            <Icon name="plus" size={20} stroke={1.8} />
          </button>
        </div>
      </div>
    </article>
  )
}
