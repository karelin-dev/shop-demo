import { Link, useSearchParams } from 'react-router'
import Icon from '../components/Icon.jsx'
import { OrderItems } from '../components/OrderItems.jsx'
import { dayMonth, rub, time } from '../lib/format.js'
import { seo } from '../lib/seo.js'
import { useShop } from '../shop.jsx'
import s from './order.module.css'

export const handle = { step: 2 }
export const meta = () => seo({ title: 'Заказ принят', description: 'Заказ в демо-магазине «Полдень» принят.', path: 'order', noindex: true })

export default function Order() {
  const [params] = useSearchParams()
  const { orders, ready } = useShop()
  const order = ready ? orders.find((o) => o.n === params.get('n')) || null : null

  if (!ready) return <div className="wrap client-page" aria-busy="true" />

  if (!order) {
    return (
      <div className="wrap client-page">
        <div className={s.missing}>
          <h1 className="h2">Заказ не найден</h1>
          <p className="muted">Заказы хранятся в браузере, где их оформили. Возможно, данные сайта были очищены.</p>
          <div className={s.btns}>
            <Link to="/orders" className="btn btn-dark">Мои заказы</Link>
            <Link to="/catalog" className="btn btn-light">В каталог</Link>
          </div>
        </div>
      </div>
    )
  }

  const tomorrow = new Date(new Date(order.createdAt).getTime() + 86400000)
  const steps = [
    ['Принят', `${dayMonth(order.createdAt)}, ${time(order.createdAt)}`],
    ['Подтверждён', 'по телефону'],
    ['Собран', 'упакуем в крафт'],
    ['В пути', order.delivery.method === 'express' ? 'сегодня' : dayMonth(tomorrow)],
    ['Доставлен', order.delivery.method === 'pickup' ? 'в пункте выдачи' : 'с 10:00 до 18:00'],
  ]

  return (
    <div className="wrap client-page">
      <div className={s.layout}>
        <div>
          <span className={`sticker ${s.sticker}`} aria-hidden="true">готово!</span>
          <p className="eyebrow" style={{ background: 'var(--linen)', marginTop: 28 }}>Заказ № {order.n} · {dayMonth(order.createdAt)}, {time(order.createdAt)}</p>
          <h1 className={`h1 ${s.title}`}>Спасибо, {order.contact.name}!<br /><span className="hl" style={{ background: 'var(--sage)', color: 'var(--ink)' }}>Заказ принят</span></h1>
          <p className="lead" style={{ maxWidth: 600 }}>
            В настоящем магазине мы позвонили бы в течение 15 минут, чтобы подтвердить время доставки.
            Это демо: заказ сохранён только в этом браузере и виден в разделе «Мои заказы».
          </p>
          <ol className={s.track} aria-label="Этапы заказа">
            {steps.map(([name, note], i) => (
              <li key={name} className={i === 0 ? s.done : ''} aria-current={i === 0 ? 'step' : undefined}>
                <b>{name}</b>
                <small>{note}</small>
              </li>
            ))}
          </ol>
          <div className={s.btns}>
            <Link to="/orders" className="btn btn-dark"><Icon name="box" size={20} />Мои заказы</Link>
            <Link to="/catalog" className="btn btn-outline">Продолжить покупки</Link>
          </div>
        </div>
        <aside className={`panel ${s.card}`} aria-labelledby="order-sum">
          <h2 id="order-sum" className="h3">Состав заказа</h2>
          <OrderItems order={order} />
          <ul className={s.facts}>
            <li>
              <Icon name="truck" size={20} />
              <span><b>{order.delivery.name}{order.delivery.price ? `, ${rub(order.delivery.price)}` : ', бесплатно'}</b>{order.delivery.city}, {order.delivery.address}</span>
            </li>
            <li>
              <Icon name="card" size={20} />
              <span><b>{order.payment}</b>{order.contact.name}, {order.contact.phone}</span>
            </li>
            {order.gift && <li><Icon name="gift" size={20} /><span><b>Подарочная упаковка</b>крафт, лента и открытка</span></li>}
          </ul>
          <p className={s.total}><span>Итого</span><span className="display num">{rub(order.total)}</span></p>
        </aside>
      </div>
    </div>
  )
}
