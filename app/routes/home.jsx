import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { bySlug, categories, look, products } from '../data/catalog.js'
import { optionOf } from '../lib/cart.js'
import { rub, things } from '../lib/format.js'
import { asset, thumbImg } from '../lib/img.js'
import { seo } from '../lib/seo.js'
import { useShop } from '../shop.jsx'
import s from './home.module.css'

export const meta = () =>
  seo({
    description: 'Демо интернет-магазина «Полдень»: керамика, лён, лампы и свечи от небольших мастерских. Каталог с фильтрами, корзина и оформление заказа.',
  })

const newItems = products.filter((p) => p.isNew)
const countIn = (slug) => products.filter((p) => p.category === slug).length

function Hero() {
  return (
    <section className={`wrap ${s.hero}`}>
      <div className={s.heroText}>
        <Link to="/catalog?new=1" className="eyebrow">
          <Icon name="leaf" size={18} />Новинки недели · {things(newItems.length)}
        </Link>
        <h1 className="h1">Дом, где <span className="hl">хорошо</span> каждое утро</h1>
        <p className="lead">Керамика, лён и лампы от небольших мастерских. Простые вещи для каждого дня: от миски за 690 ₽ до льняного белья.</p>
        <div className={s.heroBtns}>
          <Link to="/catalog" className="btn btn-primary">В каталог <Icon name="arrow" size={18} /></Link>
          <a href="#gifts" className="btn btn-white">Подарки до 3 000 ₽</a>
        </div>
        <ul className={s.facts}>
          <li><b>{rub(190)}</b>доставка в пункт выдачи</li>
          <li><b>{rub(5000)}</b>от этой суммы бесплатно</li>
          <li><b>30&nbsp;дней</b>на возврат</li>
        </ul>
      </div>
      <div className={s.heroPhoto}>
        <div className={s.arch}>
          <img
            src={asset('img/hero-1100.webp')}
            srcSet={`${asset('img/hero-600.webp')} 600w, ${asset('img/hero-1100.webp')} 1100w`}
            sizes="(max-width: 767px) 70vw, (max-width: 1099px) 80vw, 40vw"
            width="1100"
            height="1190"
            alt="Сухие травы в глиняной вазе на солнце"
            fetchPriority="high"
          />
        </div>
        <span className={`sticker ${s.heroSticker}`}>от<br />690 ₽</span>
        <Link to="/product/vases-glina" className={s.heroNote}>
          <img src={thumbImg('vases-glina-1')} alt="" width="52" height="52" loading="lazy" />
          <span><b>Вазы «Глина»</b><span>новинка, 3 290 ₽</span></span>
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </section>
  )
}

function Categories() {
  return (
    <nav className={`wrap ${s.cats}`} aria-label="Категории каталога">
      {categories.map((c) => (
        <Link key={c.slug} to={`/catalog/${c.slug}`} style={{ background: c.color }}>
          <img src={asset(`img/cat/${c.slug}.webp`)} alt="" width="120" height="120" loading="lazy" decoding="async" />
          <b>{c.name}</b>
          <span>{things(countIn(c.slug))}</span>
        </Link>
      ))}
    </nav>
  )
}

function NewArrivals() {
  const track = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })
  const update = () => {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 })
  }
  useEffect(update, [])
  const scroll = (dir) => {
    const el = track.current
    const card = el.firstElementChild
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: 'smooth' })
  }
  return (
    <section className={`wrap ${s.section}`} aria-labelledby="new-title">
      <div className={s.head}>
        <h2 id="new-title" className="h2">Только привезли</h2>
        <div className={s.headActions}>
          <button type="button" className={`icon-btn ${s.arrow}`} onClick={() => scroll(-1)} disabled={edge.start} aria-label="Предыдущие новинки">
            <Icon name="left" size={20} />
          </button>
          <button type="button" className={`icon-btn ${s.arrow}`} onClick={() => scroll(1)} disabled={edge.end} aria-label="Следующие новинки">
            <Icon name="right" size={20} />
          </button>
          <Link to="/catalog?new=1" className="link">Все новинки <Icon name="arrow" size={18} /></Link>
        </div>
      </div>
      <ul className={s.track} ref={track} onScroll={update}>
        {newItems.map((p) => (
          <li key={p.slug}><ProductCard product={p} sizes="(max-width: 767px) 70vw, (max-width: 1099px) 40vw, 340px" /></li>
        ))}
      </ul>
    </section>
  )
}

function Look() {
  const { add } = useShop()
  const [picked, setPicked] = useState(look.items)
  const [spot, setSpot] = useState(look.spots[0].slug)
  const items = look.items.map((slug) => bySlug[slug])
  const sum = items.filter((p) => picked.includes(p.slug)).reduce((n, p) => n + (optionOf(p)?.price ?? p.price), 0)
  const toggle = (slug) => setPicked((list) => (list.includes(slug) ? list.filter((x) => x !== slug) : [...list, slug]))
  const addAll = () => add(items.filter((p) => picked.includes(p.slug)).map((p) => ({ slug: p.slug, variant: p.variants?.options[0].id })))

  return (
    <section className="wrap" aria-labelledby="look-title">
      <div className={s.look}>
        <div className={s.lookPhoto}>
          <img
            src={asset('img/look-1400.webp')}
            srcSet={`${asset('img/look-800.webp')} 800w, ${asset('img/look-1400.webp')} 1400w`}
            sizes="(max-width: 1099px) 92vw, 760px"
            width="1400"
            height="1100"
            alt="Стол с льняной скатертью, сухоцветами и свечами"
            loading="lazy"
            decoding="async"
          />
          {look.spots.map((sp) => {
            const p = bySlug[sp.slug]
            const open = spot === sp.slug
            return (
              <div key={sp.slug} className={s.spotWrap} style={{ left: `${sp.x}%`, top: `${sp.y}%` }}>
                <button
                  type="button"
                  className={s.spot}
                  aria-expanded={open}
                  aria-label={`${p.name} на фото`}
                  onClick={() => setSpot(open ? null : sp.slug)}
                />
                {open && (
                  <div className={s.tip}>
                    <img src={thumbImg(p.photos[0].src)} alt="" width="46" height="46" loading="lazy" />
                    <Link to={`/product/${p.slug}`}><b>{p.name}</b><span>{rub(optionOf(p)?.price ?? p.price)}</span></Link>
                    <button type="button" className={s.tipAdd} aria-label={`В корзину: ${p.name}`} onClick={() => add({ slug: p.slug, variant: p.variants?.options[0].id })}>
                      <Icon name="plus" size={18} stroke={1.8} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className={s.lookText}>
          <span className="eyebrow">Собрать стол</span>
          <h2 id="look-title" className="h2">Ужин на&nbsp;четверых в&nbsp;один клик</h2>
          <p className="lead">Всё, что на фото, можно положить в корзину одной кнопкой. Лишнее снимите галочкой.</p>
          <ul className={s.lookList}>
            {items.map((p) => (
              <li key={p.slug}>
                <label className="check">
                  <img src={thumbImg(p.photos[0].src)} alt="" width="60" height="60" loading="lazy" />
                  <span className={s.lookName}><b>{p.name}</b><span>{optionOf(p)?.name || p.meta}</span></span>
                  <span className="price">{rub(optionOf(p)?.price ?? p.price)}</span>
                  <input type="checkbox" checked={picked.includes(p.slug)} onChange={() => toggle(p.slug)} aria-label={`Добавить в набор: ${p.name}`} />
                </label>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-primary btn-block" onClick={addAll} disabled={!picked.length}>
            {picked.length ? `Добавить ${things(picked.length)} · ${rub(sum)}` : 'Отметьте хотя бы одну вещь'}
          </button>
        </div>
      </div>
    </section>
  )
}

const GIFT_FILTERS = [
  { id: 'p1000', name: 'до 1 000 ₽', test: (p) => p.price <= 1000 },
  { id: 'p2000', name: 'до 2 000 ₽', test: (p) => p.price <= 2000 },
  { id: 'p3000', name: 'до 3 000 ₽', test: (p) => p.price <= 3000 },
  { id: 'kitchen', name: 'Для кухни', test: (p) => p.price <= 3000 && ['posuda', 'kuhnya'].includes(p.category) },
  { id: 'cozy', name: 'Для уюта', test: (p) => p.price <= 3000 && ['svet', 'dekor', 'tekstil'].includes(p.category) },
]

function Gifts() {
  const [filter, setFilter] = useState('p3000')
  const test = GIFT_FILTERS.find((f) => f.id === filter).test
  const list = products.filter((p) => p.stock && test(p)).sort((a, b) => a.pop - b.pop).slice(0, 4)
  return (
    <section id="gifts" className={`wrap ${s.section}`} aria-labelledby="gifts-title">
      <div className={s.head}>
        <h2 id="gifts-title" className="h2">Подарки до <span className={`hl ${s.giftHl}`}>3 000 ₽</span></h2>
        <div className={s.chips} role="group" aria-label="Выбор подарка">
          {GIFT_FILTERS.map((f) => (
            <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.name}</button>
          ))}
        </div>
      </div>
      <ul className={s.grid4}>
        {list.map((p) => <li key={p.slug}><ProductCard product={p} /></li>)}
      </ul>
      <p className={s.gift}>
        <span className={s.giftIc}><Icon name="gift" size={24} /></span>
        <span><b>Подарочная упаковка за 200 ₽.</b> Крафт, льняная лента и открытка с вашим текстом, написанным от руки. Отметьте при оформлении заказа.</span>
      </p>
    </section>
  )
}

const STEPS = [
  ['Пробуем дома', 'Каждая вещь месяц живёт у нас на кухне или в спальне.'],
  ['Натуральные материалы', 'Глина, лён, шерсть, дерево и стекло.'],
  ['Честно про уход', 'В карточке написано, как стирать, мыть и хранить.'],
]

function How() {
  return (
    <section className={`wrap ${s.section}`} aria-labelledby="how-title">
      <div className={s.how}>
        <div className={s.howPhoto}>
          <img
            src={asset('img/pottery-960.webp')}
            srcSet={`${asset('img/pottery-520.webp')} 520w, ${asset('img/pottery-960.webp')} 960w`}
            sizes="(max-width: 767px) 92vw, 40vw"
            width="960"
            height="1140"
            alt="Мастер работает за гончарным кругом"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className={s.howText}>
          <span className="eyebrow">Как мы выбираем вещи</span>
          <h2 id="how-title" className="h2">Вещи от небольших мастерских, а&nbsp;не с&nbsp;конвейера</h2>
          <ol className={s.steps}>
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className={s.stepNum} aria-hidden="true">0{i + 1}</span>
                <b>{title}</b>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <NewArrivals />
      <Look />
      <Gifts />
      <How />
    </>
  )
}
