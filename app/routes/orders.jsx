import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import { OrderItems } from '../components/OrderItems.jsx'
import { bySlug } from '../data/catalog.js'
import { dayMonth, rub, things } from '../lib/format.js'
import { seo } from '../lib/seo.js'
import { useShop } from '../shop.jsx'
import s from './orders.module.css'

export const meta = () => seo({ title: 'Мои заказы', description: 'Заказы, оформленные в этом браузере.', path: 'orders', noindex: true })

export default function Orders() {
  const { orders, ready, add } = useShop()
  const repeat = (o) => add(o.items.filter((it) => bySlug[it.slug]?.stock).map((it) => ({ slug: it.slug, variant: it.variant, qty: it.qty })))

  return (
    <div className="wrap client-page">
      <nav aria-label="Навигационная цепочка" className={s.crumbs}>
        <ol><li><Link to="/">Главная</Link></li><li><span aria-current="page">Мои заказы</span></li></ol>
      </nav>
      <div className={s.title}>
        <h1 className="h2">Мои заказы</h1>
        <span className="muted">хранятся в этом браузере</span>
      </div>

      {!ready ? (
        <div style={{ minHeight: 300 }} aria-busy="true" />
      ) : orders.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIc}><Icon name="box" size={32} /></span>
          <h2 className="h3">Заказов пока нет</h2>
          <p className="muted">Оформите заказ, и он появится здесь вместе с составом и статусом.</p>
          <Link to="/catalog" className="btn btn-primary">В каталог</Link>
        </div>
      ) : (
        <ul className={s.list}>
          {orders.map((o) => (
            <li key={o.n} className="panel">
              <details>
                <summary>
                  <span className={s.n}>№ {o.n}</span>
                  <span className={s.status}>Принят</span>
                  <span className="muted">{dayMonth(o.createdAt)} · {things(o.items.reduce((n, it) => n + it.qty, 0))}</span>
                  <span className="price num">{rub(o.total)}</span>
                  <Icon name="down" size={20} />
                </summary>
                <div className={s.body}>
                  <OrderItems order={o} />
                  <p className="muted">{o.delivery.name}: {o.delivery.city}, {o.delivery.address}. {o.payment}.</p>
                  <div className={s.btns}>
                    <button type="button" className="btn btn-light btn-sm" onClick={() => repeat(o)}>Повторить заказ</button>
                    <Link to={`/order?n=${encodeURIComponent(o.n)}`} className="btn btn-light btn-sm">Подробнее</Link>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
