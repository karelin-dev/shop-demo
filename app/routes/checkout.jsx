import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Thumb, variantText } from '../components/CartBits.jsx'
import Icon from '../components/Icon.jsx'
import { PromoForm, SummaryRows } from '../components/Summary.jsx'
import { DELIVERY, GIFT_PRICE, PICKUP_POINTS, totals } from '../lib/cart.js'
import { formatPhone, phoneDigits, rub } from '../lib/format.js'
import { seo } from '../lib/seo.js'
import { useShop } from '../shop.jsx'
import s from './checkout.module.css'

export const handle = { step: 1 }
export const meta = () => seo({ title: 'Оформление заказа', description: 'Оформление заказа в демо-магазине «Полдень».', path: 'checkout', noindex: true })

const isMoscow = (city) => ['москва', 'moscow', 'мск'].includes(city.trim().toLowerCase())

function validate(form) {
  const e = {}
  if (form.name.trim().length < 2) e.name = 'Как к вам обращаться?'
  const d = phoneDigits(form.phone)
  if (!d) e.phone = 'Нужен телефон, чтобы курьер мог связаться'
  else if (d.length < 10) e.phone = 'Введите номер полностью: +7 и 10 цифр'
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Проверьте адрес почты, например name@mail.ru'
  if (!form.city.trim()) e.city = 'Укажите город'
  if (form.delivery !== 'pickup' && form.street.trim().length < 3) e.street = 'Укажите улицу и дом'
  return e
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      {children}
      {error ? <span id={`${id}-err`} className="err-text">{error}</span> : hint ? <span id={`${id}-hint`} className="hint">{hint}</span> : null}
    </div>
  )
}

export default function Checkout() {
  const { cart, promo, placeOrder, ready } = useShop()
  const navigate = useNavigate()
  const formRef = useRef(null)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: 'Москва', delivery: 'courier', street: '', flat: '', entrance: '', floor: '',
    note: '', point: PICKUP_POINTS[0], payment: 'card', gift: false,
  })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }
  const moscow = isMoscow(form.city)
  const delivery = form.delivery === 'express' && !moscow ? 'courier' : form.delivery
  const t = totals(cart, { promo, delivery, gift: form.gift })

  const err = (key) => ({ 'aria-invalid': errors[key] ? 'true' : undefined, 'aria-describedby': errors[key] ? `${key}-err` : undefined })
  const onBlur = (key) => () => {
    if (!sent) return
    setErrors((e) => ({ ...e, [key]: validate(form)[key] }))
  }

  const onPhone = (e) => {
    const v = e.target.value
    let d = phoneDigits(v)
    if (v.length < form.phone.length && d === phoneDigits(form.phone)) d = d.slice(0, -1) // стёрли скобку или дефис
    set('phone', d ? formatPhone('+7' + d) : '')
  }

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    const found = validate(form)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      formRef.current.querySelector(`#${first}`)?.focus()
      return
    }
    const n = placeOrder({
      createdAt: new Date().toISOString(),
      items: t.lines.map((l) => ({ slug: l.slug, variant: l.variant, name: l.product.name, option: variantText(l), qty: l.qty, price: l.price })),
      goods: t.goods, bundle: t.bundle, promo, promoSum: t.promoSum, total: t.total,
      delivery: {
        method: delivery, name: DELIVERY[delivery].name, price: t.deliveryPrice, city: form.city.trim(),
        address: delivery === 'pickup' ? (moscow ? form.point : 'пункт подберём после звонка') : [form.street, form.flat && `кв. ${form.flat}`].filter(Boolean).join(', '),
      },
      payment: form.payment === 'card' ? 'Картой при получении' : 'Наличными при получении',
      gift: form.gift,
      contact: { name: form.name.trim(), phone: form.phone, email: form.email.trim() },
    })
    navigate(`/order?n=${encodeURIComponent(n)}`)
  }

  if (!ready) return <div className="wrap client-page" aria-busy="true" />

  if (!t.lines.length) {
    return (
      <div className="wrap client-page">
        <div className={s.empty}>
          <h1 className="h2">Корзина пуста</h1>
          <p className="muted">Чтобы оформить заказ, добавьте в корзину хотя бы одну вещь.</p>
          <Link to="/catalog" className="btn btn-primary">В каталог</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="wrap client-page">
      <div className={s.layout}>
        <form ref={formRef} className={s.form} onSubmit={submit} noValidate aria-labelledby="co-title">
          <Link to="/cart" className={s.back}><Icon name="left" size={16} />Вернуться в корзину</Link>
          <h1 id="co-title" className="h2">Оформление заказа</h1>

          <fieldset className={s.sec}>
            <legend><b>1</b>Контакты</legend>
            <div className={s.two}>
              <Field id="name" label="Имя" error={errors.name}>
                <input id="name" className="input" autoComplete="given-name" value={form.name} onChange={(e) => set('name', e.target.value)} onBlur={onBlur('name')} {...err('name')} />
              </Field>
              <Field id="phone" label="Телефон" error={errors.phone}>
                <input id="phone" className="input num" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={onPhone} onBlur={onBlur('phone')} {...err('phone')} />
              </Field>
            </div>
            <Field id="email" label="Почта для чека, необязательно" error={errors.email}>
              <input id="email" className="input" type="email" autoComplete="email" placeholder="name@mail.ru" value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={onBlur('email')} {...err('email')} />
            </Field>
          </fieldset>

          <fieldset className={s.sec}>
            <legend><b>2</b>Доставка</legend>
            <Field id="city" label="Город" error={errors.city} hint={moscow ? null : 'Экспресс-доставка работает только по Москве'}>
              <input id="city" className="input" autoComplete="address-level2" value={form.city} onChange={(e) => set('city', e.target.value)} onBlur={onBlur('city')} {...err('city')} />
            </Field>
            <div className={s.opts} role="radiogroup" aria-label="Способ доставки">
              {Object.entries(DELIVERY).map(([id, d]) => {
                const disabled = id === 'express' && !moscow
                const price = d.free && t.free ? 0 : d.price
                const when = { courier: 'Завтра с 10:00 до 18:00', pickup: '2–4 дня, пункт выберете ниже', express: 'Сегодня до 22:00 при заказе до 14:00' }[id]
                return (
                  <label key={id} className={`${s.opt} ${disabled ? s.off : ''}`}>
                    <span className="check"><input type="radio" name="delivery" value={id} checked={delivery === id} disabled={disabled} onChange={() => set('delivery', id)} /></span>
                    <span className={s.optText}><b>{d.name}</b><small>{disabled ? 'Только по Москве' : when}</small></span>
                    <span className="num">{price === 0 ? 'бесплатно' : rub(price)}</span>
                  </label>
                )
              })}
            </div>
            {delivery === 'pickup' ? (
              moscow ? (
                <Field id="point" label="Пункт выдачи">
                  <select id="point" className="input" value={form.point} onChange={(e) => set('point', e.target.value)}>
                    {PICKUP_POINTS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              ) : (
                <p className={s.note}>В демо пункты выдачи есть только для Москвы. В настоящем магазине здесь была бы карта пунктов вашего города.</p>
              )
            ) : (
              <>
                <div className={s.address}>
                  <Field id="street" label="Улица и дом" error={errors.street}>
                    <input id="street" className="input" autoComplete="address-line1" value={form.street} onChange={(e) => set('street', e.target.value)} onBlur={onBlur('street')} {...err('street')} />
                  </Field>
                  <Field id="flat" label="Квартира"><input id="flat" className="input" autoComplete="address-line2" value={form.flat} onChange={(e) => set('flat', e.target.value)} /></Field>
                  <Field id="entrance" label="Подъезд"><input id="entrance" className="input" inputMode="numeric" value={form.entrance} onChange={(e) => set('entrance', e.target.value)} /></Field>
                  <Field id="floor" label="Этаж"><input id="floor" className="input" inputMode="numeric" value={form.floor} onChange={(e) => set('floor', e.target.value)} /></Field>
                </div>
                <Field id="note" label="Комментарий курьеру">
                  <input id="note" className="input" placeholder="Например, код домофона" value={form.note} onChange={(e) => set('note', e.target.value)} />
                </Field>
              </>
            )}
          </fieldset>

          <fieldset className={`${s.sec} ${s.last}`}>
            <legend><b>3</b>Оплата</legend>
            <div className={s.opts} role="radiogroup" aria-label="Способ оплаты">
              <label className={s.opt}>
                <span className="check"><input type="radio" name="payment" value="card" checked={form.payment === 'card'} onChange={() => set('payment', 'card')} /></span>
                <span className={s.optText}><b>Картой при получении</b><small>Курьер привезёт терминал</small></span>
                <Icon name="card" />
              </label>
              <label className={s.opt}>
                <span className="check"><input type="radio" name="payment" value="cash" checked={form.payment === 'cash'} onChange={() => set('payment', 'cash')} /></span>
                <span className={s.optText}><b>Наличными при получении</b><small>Курьер привезёт сдачу</small></span>
                <Icon name="box" />
              </label>
              <div className={`${s.opt} ${s.off}`} aria-disabled="true">
                <span className={s.fakeRadio} aria-hidden="true" />
                <span className={s.optText}><b>Онлайн на сайте</b><small>В демо-версии отключена</small></span>
              </div>
            </div>
            <label className={`check ${s.gift}`}>
              <input type="checkbox" checked={form.gift} onChange={(e) => set('gift', e.target.checked)} />
              <span>Подарочная упаковка: крафт, лента и открытка от руки, +{rub(GIFT_PRICE)}</span>
            </label>
          </fieldset>

          <button type="submit" className={`btn btn-primary btn-block ${s.submitMobile}`}>Подтвердить заказ · {rub(t.total)}</button>
        </form>

        <aside className={`panel ${s.summary}`} aria-labelledby="co-sum-title">
          <h2 id="co-sum-title" className="h3">Ваш заказ</h2>
          <ul className={s.minis}>
            {t.lines.map((l) => (
              <li key={l.key}>
                <span className={s.miniPic}><Thumb product={l.product} option={l.option} size={64} /><b>{l.qty}</b></span>
                <span className={s.miniName}><span>{l.product.name}</span><small>{variantText(l)}</small></span>
                <span className="num">{rub(l.sum)}</span>
              </li>
            ))}
          </ul>
          <SummaryRows t={t} delivery={delivery} />
          <PromoForm />
          <p className={s.total}>
            <span>Итого</span>
            <span className="display num">{rub(t.total)}</span>
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => formRef.current.requestSubmit()}>Подтвердить заказ</button>
          <p className={s.demo}><Icon name="leaf" size={18} />Это демо: заказ сохранится только в вашем браузере, деньги не списываются.</p>
        </aside>
      </div>
    </div>
  )
}
