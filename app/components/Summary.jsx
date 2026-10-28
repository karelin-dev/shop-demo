// Сводка заказа: строки сумм и промокод. Общие для корзины и оформления.
import { useState } from 'react'
import { rub, things } from '../lib/format.js'
import { useShop } from '../shop.jsx'
import Icon from './Icon.jsx'
import s from './Summary.module.css'

export function PromoForm() {
  const { promo, applyPromo, removePromo } = useShop()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  if (promo) {
    return (
      <p className={s.promoOn}>
        <span className="chip"><Icon name="tag" size={16} />{promo} · −10%</span>
        <button type="button" className={s.promoX} onClick={removePromo} aria-label="Убрать промокод"><Icon name="close" size={16} /></button>
      </p>
    )
  }
  const submit = (e) => {
    e.preventDefault()
    if (!code.trim()) return
    if (applyPromo(code)) {
      setCode('')
      setError('')
    } else setError('Такого промокода нет. В демо работает ПОЛДЕНЬ10')
  }
  return (
    <form className={s.promo} onSubmit={submit} noValidate>
      <label className="visually-hidden" htmlFor="promo">Промокод</label>
      <input
        id="promo"
        className="input"
        placeholder="Промокод"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby="promo-note"
        autoComplete="off"
      />
      <button type="submit" className="btn btn-dark btn-sm">Применить</button>
      <p id="promo-note" className={error ? 'err-text' : 'hint'}>{error || 'Для демо: ПОЛДЕНЬ10, скидка 10%'}</p>
    </form>
  )
}

export function SummaryRows({ t, delivery = null }) {
  return (
    <dl className={s.rows}>
      <div><dt>Товары, {things(t.count)}</dt><dd className="num">{rub(t.goods)}</dd></div>
      {t.bundle > 0 && <div><dt>Скидка за комплект</dt><dd className={`num ${s.minus}`}>−{rub(t.bundle)}</dd></div>}
      {t.promoSum > 0 && <div><dt>Скидка по промокоду</dt><dd className={`num ${s.minus}`}>−{rub(t.promoSum)}</dd></div>}
      <div>
        <dt>Доставка</dt>
        <dd className="num">{delivery === null ? (t.free ? 'бесплатно' : 'от 190 ₽') : t.deliveryPrice === 0 ? 'бесплатно' : rub(t.deliveryPrice)}</dd>
      </div>
      {t.giftPrice > 0 && <div><dt>Подарочная упаковка</dt><dd className="num">{rub(t.giftPrice)}</dd></div>}
    </dl>
  )
}
