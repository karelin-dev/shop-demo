import { useCallback, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { categories, products } from '../data/catalog.js'
import { things } from '../lib/format.js'
import { totals } from '../lib/cart.js'
import useDialog from '../lib/useDialog.js'
import { useShop } from '../shop.jsx'
import Icon, { SunMark } from './Icon.jsx'
import s from './Header.module.css'

const countIn = (slug) => products.filter((p) => p.category === slug).length

function Marquee() {
  const sun = <SunMark size={12} />
  return (
    <div className={s.marquee}>
      <span>бесплатная доставка от 5 000 ₽</span>
      {sun}
      <span>возврат 30 дней</span>
      <span className={s.wide}>{sun}</span>
      <span className={s.wide}>оплата при получении</span>
      <span className={s.wide}>{sun}</span>
      <span className={s.wide}>упакуем в крафт</span>
    </div>
  )
}

export function Logo({ size = 34 }) {
  return (
    <Link to="/" className={s.logo} aria-label="Полдень, на главную">
      <SunMark size={size} />
      <span aria-hidden="true">полдень</span>
    </Link>
  )
}

function SearchForm({ className, onDone, autoFocus }) {
  const navigate = useNavigate()
  const onSubmit = (e) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q').trim()
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog')
    onDone?.()
  }
  return (
    <form role="search" className={className} onSubmit={onSubmit}>
      <Icon name="search" size={20} />
      <label className="visually-hidden" htmlFor={autoFocus ? 'q-menu' : 'q'}>Поиск по каталогу</label>
      <input id={autoFocus ? 'q-menu' : 'q'} name="q" type="search" placeholder="Кружка, лён, ваза…" autoComplete="off" autoFocus={autoFocus} />
    </form>
  )
}

function Menu({ open, onClose, favs }) {
  const ref = useDialog(open, onClose)
  return (
    <dialog ref={ref} className={s.menu} aria-label="Меню">
      {open && (
        <div className={s.menuBody}>
          <div className={s.menuTop}>
            <Logo size={28} />
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть меню">
              <Icon name="close" />
            </button>
          </div>
          <SearchForm className={s.menuSearch} onDone={onClose} autoFocus />
          <nav aria-label="Каталог">
            <ul className={s.menuList}>
              <li>
                <Link to="/catalog" onClick={onClose}>
                  <span>Весь каталог</span>
                  <span className="muted">{things(products.length)}</span>
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/catalog/${c.slug}`} onClick={onClose}>
                    <span><i style={{ background: c.color }} />{c.name}</span>
                    <span className="muted">{countIn(c.slug)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className={s.menuLinks}>
            <Link to="/favorites" className="link" onClick={onClose}>
              <Icon name="heart" size={20} />Избранное{favs ? ` · ${favs}` : ''}
            </Link>
            <Link to="/orders" className="link" onClick={onClose}>
              <Icon name="box" size={20} />Мои заказы
            </Link>
          </div>
        </div>
      )}
    </dialog>
  )
}

const STEPS = ['Корзина', 'Оформление', 'Готово']

function Steps({ step }) {
  return (
    <ol className={s.steps} aria-label="Шаги заказа">
      {STEPS.map((name, i) => (
        <li key={name} className={i < step ? s.done : i === step ? s.now : ''} aria-current={i === step ? 'step' : undefined}>
          <b aria-hidden="true">{i < step ? <Icon name="check" size={14} stroke={2.2} /> : i + 1}</b>
          {i === 0 ? <Link to="/cart">{name}</Link> : name}
        </li>
      ))}
    </ol>
  )
}

export default function Header({ step = null }) {
  const { cart, favs, openCart } = useShop()
  const [menu, setMenu] = useState(false)
  const closeMenu = useCallback(() => setMenu(false), [])
  const { pathname } = useLocation()
  const count = totals(cart).count

  if (step !== null) {
    return (
      <header className={`${s.header} ${s.minimal}`}>
        <div className={`wrap ${s.bar}`}>
          <Logo />
          <Steps step={step} />
          <p className={s.help}>
            <Icon name="phone" size={18} />
            <span>Вопрос по заказу: <b>+7 495 000-00-00</b></span>
          </p>
        </div>
      </header>
    )
  }

  return (
    <>
      <Marquee />
      <header className={s.header}>
        <div className={`wrap ${s.bar}`}>
          <button type="button" className={`icon-btn ${s.burger}`} onClick={() => setMenu(true)} aria-label="Открыть меню" aria-expanded={menu}>
            <Icon name="menu" />
          </button>
          <Logo />
          <nav className={s.nav} aria-label="Категории">
            <NavLink to="/catalog" end className={({ isActive }) => (isActive ? s.on : undefined)}>
              Каталог
            </NavLink>
            {categories.map((c) => (
              <NavLink key={c.slug} to={`/catalog/${c.slug}`} className={({ isActive }) => (isActive ? s.on : undefined)}>
                {c.name}
              </NavLink>
            ))}
          </nav>
          <div className={s.actions}>
            <SearchForm className={s.search} key={pathname} />
            <button type="button" className={`icon-btn ${s.searchBtn}`} onClick={() => setMenu(true)} aria-label="Поиск">
              <Icon name="search" size={20} />
            </button>
            <Link to="/favorites" className={`icon-btn ${s.extra}`} aria-label={`Избранное: ${favs.length}`}>
              <Icon name="heart" size={20} />
              {favs.length > 0 && <span className={s.dot} aria-hidden="true">{favs.length}</span>}
            </Link>
            <Link to="/orders" className={`icon-btn ${s.extra}`} aria-label="Мои заказы">
              <Icon name="box" size={20} />
            </Link>
            <button type="button" className={s.cart} onClick={openCart} aria-label={`Корзина: ${things(count)}`}>
              <Icon name="bag" size={20} className={s.cartIcon} />
              <span className={s.cartText}>Корзина</span>
              <span className={s.count} data-empty={count === 0} aria-hidden="true">{count}</span>
            </button>
          </div>
        </div>
      </header>
      <Menu open={menu} onClose={closeMenu} favs={favs.length} />
    </>
  )
}
