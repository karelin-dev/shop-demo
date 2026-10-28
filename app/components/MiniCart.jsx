import { Link } from 'react-router'
import { totals } from '../lib/cart.js'
import { rub, things } from '../lib/format.js'
import useDialog from '../lib/useDialog.js'
import { useShop } from '../shop.jsx'
import { FreeDelivery, pickUpsell, Stepper, Thumb, Upsell, variantText } from './CartBits.jsx'
import Icon from './Icon.jsx'
import s from './MiniCart.module.css'

export default function MiniCart() {
  const { cart, drawer, closeCart, setQty, remove } = useShop()
  const ref = useDialog(drawer.open, closeCart)
  const t = totals(cart)
  const added = drawer.added ? t.lines.filter((l) => drawer.added.includes(l.key)) : []

  return (
    <dialog ref={ref} className={s.drawer} aria-labelledby="mini-cart-title">
      {drawer.open && (
        <div className={s.body}>
          <div className={s.top}>
            <h2 id="mini-cart-title" className="h3">
              Корзина <span className={s.count}>{things(t.count)}</span>
            </h2>
            <button type="button" className="icon-btn" onClick={closeCart} aria-label="Закрыть корзину">
              <Icon name="close" />
            </button>
          </div>

          {added.length > 0 && (
            <p className={s.added} role="status">
              <Icon name="check" size={18} stroke={2} />
              {added.length === 1 ? `${added[0].product.name}: в корзине` : `Добавлено: ${things(added.length)}`}
            </p>
          )}

          {t.lines.length === 0 ? (
            <div className={s.empty}>
              <p>В корзине пока пусто.</p>
              <Link to="/catalog" className="btn btn-dark" onClick={closeCart}>В каталог</Link>
            </div>
          ) : (
            <>
              <ul className={s.lines}>
                {t.lines.map((l) => (
                  <li key={l.key}>
                    <Thumb product={l.product} option={l.option} size={72} />
                    <div className={s.info}>
                      <Link to={`/product/${l.slug}`} className={s.name} onClick={closeCart}>{l.product.name}</Link>
                      <span className={s.variant}>{variantText(l)}</span>
                      <div className={s.controls}>
                        <Stepper small value={l.qty} name={l.product.name} onChange={(q) => setQty(l.key, q)} />
                        <button type="button" className={s.remove} onClick={() => remove(l.key, l.product.name)} aria-label={`Удалить: ${l.product.name}`}>
                          <Icon name="trash" size={18} />
                        </button>
                      </div>
                    </div>
                    <span className="price num">{rub(l.sum)}</span>
                  </li>
                ))}
              </ul>
              <FreeDelivery t={t} className={s.free} />
              {!t.free && (
                <div className={s.more}>
                  <h3 className={s.moreTitle}>С этим часто берут</h3>
                  <Upsell items={pickUpsell(cart, t.freeLeft, 2)} />
                </div>
              )}
              <div className={s.foot}>
                <p className={s.total}>
                  <span>Итого</span>
                  <span className="display num">{rub(t.goods - t.bundle)}</span>
                </p>
                <Link to="/checkout" className="btn btn-primary btn-block" onClick={closeCart}>Оформить заказ</Link>
                <Link to="/cart" className="btn btn-light btn-block" onClick={closeCart}>Перейти в корзину</Link>
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}
