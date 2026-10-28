import { Link } from 'react-router'
import { categories } from '../data/catalog.js'
import { useShop } from '../shop.jsx'
import Icon from './Icon.jsx'
import { Logo } from './Header.jsx'
import s from './Footer.module.css'

const BENEFITS = [
  ['truck', 'Доставка по России', 'Курьер или пункт выдачи', 'var(--sky)'],
  ['gift', 'Бесплатно от 5 000 ₽', 'И упаковка в крафт', 'var(--butter)'],
  ['return', 'Возврат 30 дней', 'Если вещь не подошла', 'var(--powder)'],
  ['card', 'Оплата при получении', 'Картой или наличными', 'var(--sage)'],
]

export function Benefits() {
  return (
    <section className="wrap" aria-label="Условия покупки">
      <ul className={s.benefits}>
        {BENEFITS.map(([icon, title, text, bg]) => (
          <li key={title} style={{ background: bg }}>
            <span className={s.ic}><Icon name={icon} size={24} /></span>
            <span><b>{title}</b>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Footer({ minimal = false }) {
  const { notify } = useShop()
  const onSubscribe = (e) => {
    e.preventDefault()
    e.currentTarget.reset()
    notify('Демо: адрес никуда не отправляется, рассылки нет')
  }

  if (minimal) {
    return (
      <footer className={`wrap ${s.mini}`}>
        Демо-проект для портфолио: магазин вымышленный, заказы не отправляются и оплата не списывается.
      </footer>
    )
  }

  return (
    <>
      <Benefits />
      <footer className={s.footer}>
        <div className="wrap">
          <div className={s.cols}>
            <div className={s.about}>
              <Logo size={30} />
              <p className="muted">Керамика, лён и лампы от небольших мастерских. Простые вещи, которыми пользуются каждый день.</p>
              <form className={s.sub} onSubmit={onSubscribe}>
                <label className="visually-hidden" htmlFor="sub-email">Почта для новинок</label>
                <input id="sub-email" className="input" type="email" name="email" placeholder="Почта для новинок" autoComplete="email" required />
                <button type="submit" className="btn btn-dark btn-sm">Подписаться</button>
              </form>
            </div>
            <nav aria-label="Каталог">
              <h2 className={s.h}>Каталог</h2>
              <ul>
                {categories.map((c) => (
                  <li key={c.slug}><Link to={`/catalog/${c.slug}`}>{c.name}</Link></li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Покупателям">
              <h2 className={s.h}>Покупателям</h2>
              <ul>
                <li><Link to="/cart">Корзина</Link></li>
                <li><Link to="/orders">Мои заказы</Link></li>
                <li><Link to="/favorites">Избранное</Link></li>
                <li><Link to="/catalog?sale=1">Скидки</Link></li>
              </ul>
            </nav>
            <div>
              <h2 className={s.h}>Условия</h2>
              <ul className="muted">
                <li>Доставка от 190 ₽, бесплатно от 5 000 ₽</li>
                <li>Возврат 30 дней</li>
                <li>Оплата при получении</li>
                <li>Подарочная упаковка 200 ₽</li>
              </ul>
            </div>
          </div>
          <div className={s.word} aria-hidden="true" />
          <div className={s.note}>
            <span>Демо-проект для портфолио: магазин вымышленный, заказы не отправляются. Фото: Unsplash.</span>
            <a href="https://github.com/karelin-dev/shop-demo">Код на GitHub · Иван Карелин</a>
          </div>
        </div>
      </footer>
    </>
  )
}
