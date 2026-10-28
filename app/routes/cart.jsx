import { Link } from 'react-router'
import { FreeDelivery, pickUpsell, Stepper, Thumb, Upsell, variantText } from '../components/CartBits.jsx'
import Icon from '../components/Icon.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { PromoForm, SummaryRows } from '../components/Summary.jsx'
import { products } from '../data/catalog.js'
import { totals } from '../lib/cart.js'
import { rub, things } from '../lib/format.js'
import { seo } from '../lib/seo.js'
import { useShop } from '../shop.jsx'
import s from './cart.module.css'

export const meta = () => seo({ title: 'Корзина', description: 'Корзина демо-магазина «Полдень».', path: 'cart', noindex: true })

function Empty() {
  const popular = [...products].sort((a, b) => a.pop - b.pop).slice(0, 4)
  return (
    <>
      <div className={s.empty}>
        <span className={s.emptyIc}><Icon name="bag" size={32} /></span>
        <h2 className="h3">В корзине пусто</h2>
        <p className="muted">Начните с новинок недели или подарков до 3 000 ₽.</p>
        <Link to="/catalog?new=1" className="btn btn-dark">Смотреть новинки</Link>
      </div>
      <h2 className="h3" style={{ margin: '56px 0 24px' }}>Чаще всего берут</h2>
      <ul className={s.grid}>
        {popular.map((p) => <li key={p.slug}><ProductCard product={p} /></li>)}
      </ul>
    </>
  )
}

export default function Cart() {
  const { cart, promo, setQty, remove, ready } = useShop()
  const t = totals(cart, { promo })

  return (
    <div className="wrap client-page">
      <nav aria-label="Навигационная цепочка" className={s.crumbs}>
        <ol><li><Link to="/">Главная</Link></li><li><span aria-current="page">Корзина</span></li></ol>
      </nav>
      <div className={s.title}>
        <h1 className="h2">Корзина</h1>
        {ready && t.count > 0 && <span className="muted">{things(t.count)}</span>}
      </div>

      {!ready ? (
        <div className={s.loading} aria-busy="true" />
      ) : t.lines.length === 0 ? (
        <Empty />
      ) : (
        <div className={s.layout}>
          <div>
            <div className={s.freeBox}>
              <FreeDelivery t={t} />
              {!t.free && (
                <>
                  <p className={s.upHint}>Добавьте одну из этих вещей, и доставка станет бесплатной</p>
                  <div className={s.upsell}><Upsell items={pickUpsell(cart, t.freeLeft, 3)} /></div>
                </>
              )}
            </div>
            <ul className={s.lines}>
              {t.lines.map((l) => (
                <li key={l.key}>
                  <Link to={`/product/${l.slug}`} className={s.pic} tabIndex={-1} aria-hidden="true">
                    <Thumb product={l.product} option={l.option} size={120} />
                  </Link>
                  <div className={s.info}>
                    <Link to={`/product/${l.slug}`} className={s.name}>{l.product.name}</Link>
                    <span className="muted">{variantText(l)}</span>
                    {l.bundle && <span className={s.bundleTag}>в комплекте</span>}
                    <button type="button" className={s.remove} onClick={() => remove(l.key, l.product.name)}>
                      <Icon name="trash" size={16} />Удалить
                    </button>
                  </div>
                  <Stepper value={l.qty} name={l.product.name} onChange={(q) => setQty(l.key, q)} />
                  <div className={s.sum}>
                    <span className="price num">{rub(l.sum)}</span>
                    {l.qty > 1 && <span className="muted num">{rub(l.price)} × {l.qty}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <aside className={`panel ${s.summary}`} aria-labelledby="summary-title">
            <h2 id="summary-title" className="h3">Ваш заказ</h2>
            <SummaryRows t={t} />
            <PromoForm />
            <p className={s.total}>
              <span>Итого</span>
              <span className="display num">{rub(t.total)}</span>
            </p>
            <Link to="/checkout" className="btn btn-primary btn-block">Перейти к оформлению <Icon name="arrow" size={18} /></Link>
            <ul className={s.notes}>
              <li><Icon name="card" size={18} />Оплата при получении, картой или наличными</li>
              <li><Icon name="return" size={18} />Возврат 30 дней</li>
            </ul>
          </aside>
        </div>
      )}
    </div>
  )
}
