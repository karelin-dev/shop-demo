// Состав заказа: миниатюра с количеством, название, вариант, сумма
import { bySlug } from '../data/catalog.js'
import { optionOf } from '../lib/cart.js'
import { rub } from '../lib/format.js'
import { Thumb } from './CartBits.jsx'
import s from './OrderItems.module.css'

export function OrderItems({ order }) {
  return (
    <ul className={s.items}>
      {order.items.map((it) => {
        const p = bySlug[it.slug]
        return (
          <li key={`${it.slug}:${it.variant}`}>
            {p && <span className={s.pic}><Thumb product={p} option={optionOf(p, it.variant)} size={64} /><b>{it.qty}</b></span>}
            <span className={s.name}><span>{it.name}</span><small>{it.option}</small></span>
            <span className="num">{rub(it.price * it.qty)}</span>
          </li>
        )
      })}
    </ul>
  )
}
