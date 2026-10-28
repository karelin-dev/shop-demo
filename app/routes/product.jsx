import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Stepper, Thumb } from '../components/CartBits.jsx'
import Gallery from '../components/Gallery.jsx'
import Icon from '../components/Icon.jsx'
import NotFound from '../components/NotFound.jsx'
import ProductCard, { Badge } from '../components/ProductCard.jsx'
import { bySlug, categoryBySlug, products } from '../data/catalog.js'
import { BUNDLE_DISCOUNT, FREE_FROM, optionOf, totals } from '../lib/cart.js'
import { rub } from '../lib/format.js'
import { SITE } from '../lib/img.js'
import { seo } from '../lib/seo.js'
import { useShop } from '../shop.jsx'
import s from './product.module.css'

export const meta = ({ params }) => {
  const p = bySlug[params.slug]
  if (!p) return seo({ title: 'Товар не найден', description: 'Такого товара нет.', noindex: true })
  const c = categoryBySlug[p.category]
  const url = `${SITE}product/${p.slug}`
  const image = `${SITE}img/p/${p.photos[0].src}-1200.webp`
  return seo({
    title: p.name,
    description: `${p.name} за ${rub(p.price)}. ${p.text}`.slice(0, 200),
    path: `product/${p.slug}`,
    image,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: p.name,
          description: p.text,
          image: p.photos.map((ph) => `${SITE}img/p/${ph.src}-1200.webp`),
          category: c.name,
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'RUB',
            price: p.price,
            availability: p.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE },
            { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE}catalog/${c.slug}` },
            { '@type': 'ListItem', position: 3, name: p.name, item: url },
          ],
        },
      ],
    },
  })
}

function Variants({ p, value, onChange }) {
  const v = p.variants
  const current = optionOf(p, value)
  return (
    <fieldset className={s.variants}>
      <legend className={s.label}>{v.label}{v.type === 'color' ? `: ${current.name}` : ''}</legend>
      {v.type === 'color' ? (
        <div className={s.colors}>
          {v.options.map((o) => (
            <label key={o.id} className={s.color}>
              <input type="radio" name="variant" value={o.id} checked={value === o.id} onChange={() => onChange(o)} />
              <span style={{ background: o.hex }} aria-hidden="true" />
              <span className="visually-hidden">{o.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className={s.sizes}>
          {v.options.map((o) => (
            <label key={o.id} className={s.size}>
              <input type="radio" name="variant" value={o.id} checked={value === o.id} onChange={() => onChange(o)} />
              <span><b>{o.name}</b><small>{o.note} · {rub(o.price)}</small></span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  )
}

function Delivery({ price }) {
  const { cart, ready } = useShop()
  const goods = ready ? totals(cart).goods : 0
  const left = FREE_FROM - goods - price
  return (
    <ul className={`${s.delivery} panel`}>
      <li>
        <Icon name="truck" />
        <span>
          <b>Курьером завтра, 390 ₽</b>
          {left > 0
            ? `Бесплатно от ${rub(FREE_FROM)}: с этой вещью останется ${rub(left)}`
            : 'С этой вещью доставка курьером бесплатная'}
        </span>
      </li>
      <li>
        <Icon name="pin" />
        <span><b>Пункт выдачи, 2–4 дня, 190 ₽</b>Выберете удобный пункт при оформлении</span>
      </li>
      <li>
        <Icon name="return" />
        <span><b>Возврат 30 дней</b>Если вещь не подошла, заберём курьером</span>
      </li>
    </ul>
  )
}

function Bundle({ p }) {
  const { add } = useShop()
  const items = [p, ...p.bundle.map((slug) => bySlug[slug])]
  const priceOf = (x) => optionOf(x)?.price ?? x.price
  const sum = items.reduce((n, x) => n + priceOf(x), 0)
  const discount = Math.round(sum * BUNDLE_DISCOUNT)
  return (
    <section className={s.section} aria-labelledby="bundle-title">
      <span className="eyebrow" style={{ background: 'var(--linen)' }}>Комплектом на 10% дешевле</span>
      <h2 id="bundle-title" className="h2" style={{ margin: '14px 0 24px' }}>Соберите комплект</h2>
      <div className={s.bundle}>
        <ul className={s.bundleItems}>
          {items.map((x) => (
            <li key={x.slug}>
              <Thumb product={x} size={96} round />
              <span>
                <Link to={`/product/${x.slug}`}>{x.name}</Link>
                <small>{optionOf(x)?.name || x.meta}</small>
                <b className="num">{rub(priceOf(x))}</b>
              </span>
            </li>
          ))}
        </ul>
        <div className={s.bundleSum}>
          <p className="muted">Вместе <s className="num">{rub(sum)}</s> · скидка 10%</p>
          <p className="display num">{rub(sum - discount)}</p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={items.some((x) => !x.stock)}
            onClick={() => add(items.map((x) => ({ slug: x.slug, variant: x.variants?.options[0].id, bundle: p.slug })))}
          >
            Добавить комплект
          </button>
        </div>
      </div>
    </section>
  )
}

function Recent({ current }) {
  const { recent, ready } = useShop()
  const list = ready ? recent.filter((x) => x !== current).map((x) => bySlug[x]).filter(Boolean).slice(0, 4) : []
  if (!list.length) return null
  return (
    <section className={s.section} aria-labelledby="recent-title">
      <h2 id="recent-title" className="h3" style={{ marginBottom: 20 }}>Вы смотрели</h2>
      <ul className={s.recent}>
        {list.map((x) => (
          <li key={x.slug}>
            <Link to={`/product/${x.slug}`}>
              <Thumb product={x} size={64} round />
              <span><b>{x.name}</b><span className="num">{rub(x.price)}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Product({ p }) {
  const { add, favs, toggleFav, viewed, notify } = useShop()
  const [variant, setVariant] = useState(p.variants?.options[0].id ?? null)
  const [photo, setPhoto] = useState(0)
  const [qty, setQty] = useState(1)
  const [waiting, setWaiting] = useState(false)
  const c = categoryBySlug[p.category]
  const option = optionOf(p, variant)
  const price = option?.price ?? p.price
  const fav = favs.includes(p.slug)

  useEffect(() => {
    viewed(p.slug)
  }, [p.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const similar = [
    ...products.filter((x) => x.category === p.category && x.slug !== p.slug),
    ...products.filter((x) => x.category !== p.category),
  ].slice(0, 4)

  return (
    <div className="wrap">
      <nav aria-label="Навигационная цепочка" className={s.crumbs}>
        <ol>
          <li><Link to="/">Главная</Link></li>
          <li><Link to={`/catalog/${c.slug}`}>{c.name}</Link></li>
          <li><span aria-current="page">{p.name}</span></li>
        </ol>
      </nav>

      <div className={s.top}>
        <Gallery photos={p.photos} index={photo} onIndex={setPhoto} label={p.name} />

        <div className={s.info}>
          <div className={s.tags}>
            <Link to={`/catalog/${c.slug}`} className="eyebrow" style={{ background: c.color }}>{c.name} · {p.materials.join(', ').toLowerCase()}</Link>
            <Badge product={p} className={s.badge} />
          </div>
          <h1 className="h2">{p.name}</h1>
          <p className={p.stock ? s.stock : s.noStock}>
            <i aria-hidden="true" />
            {p.stock ? (p.stock < 10 ? `В наличии: ${p.stock} шт.` : 'В наличии') : 'Нет в наличии, ждём в ноябре'}
          </p>
          <p className={s.price}>
            <span className="display num">{rub(price)}</span>
            {p.oldPrice && <s className="num"><span className="visually-hidden">без скидки </span>{rub(p.oldPrice)}</s>}
            <span className="muted">{option ? `за ${option.name}` : p.meta.split(' · ').at(-1)}</span>
          </p>

          {p.variants && (
            <Variants
              p={p}
              value={variant}
              onChange={(o) => {
                setVariant(o.id)
                if (o.photo !== undefined) setPhoto(o.photo)
              }}
            />
          )}

          <div className={s.buy}>
            <span className={`display num ${s.barPrice}`} aria-hidden="true">{rub(price * qty)}</span>
            {p.stock ? (
              <>
                <Stepper value={qty} onChange={setQty} name={p.name} />
                <button type="button" className={`btn btn-primary ${s.add}`} onClick={() => add({ slug: p.slug, variant, qty })}>
                  <Icon name="bag" size={20} />В корзину
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`btn ${waiting ? 'btn-light' : 'btn-dark'} ${s.add}`}
                onClick={() => {
                  setWaiting(true)
                  notify('Демо: в настоящем магазине пришло бы письмо, когда товар появится')
                }}
                disabled={waiting}
              >
                {waiting ? <><Icon name="check" size={20} />Сообщим о поступлении</> : 'Сообщить о поступлении'}
              </button>
            )}
            <button
              type="button"
              className={`icon-btn ${s.fav} ${fav ? s.favOn : ''}`}
              aria-pressed={fav}
              aria-label="В избранное"
              onClick={() => toggleFav(p.slug, p.name)}
            >
              <Icon name="heart" size={22} fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>

          <Delivery price={price * qty} />

          <div className={s.acc}>
            <details open>
              <summary>Описание <Icon name="plus" size={18} /></summary>
              <p>{p.text}</p>
            </details>
            <details>
              <summary>Характеристики <Icon name="plus" size={18} /></summary>
              <dl>
                {p.details.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </details>
            <details>
              <summary>Доставка и оплата <Icon name="plus" size={18} /></summary>
              <p>Курьер по Москве на следующий день с 10:00 до 18:00, 390 ₽. Пункт выдачи по России за 2–4 дня, 190 ₽. От 5 000 ₽ доставка бесплатная. Оплата картой или наличными при получении, упаковка в крафт без доплаты.</p>
            </details>
            <details>
              <summary>Возврат <Icon name="plus" size={18} /></summary>
              <p>Вернуть вещь можно в течение 30 дней, если она не была в использовании. Курьер заберёт её бесплатно, деньги вернутся за 1–3 дня.</p>
            </details>
          </div>
        </div>
      </div>

      {p.bundle && <Bundle p={p} />}

      <section className={s.section} aria-labelledby="similar-title">
        <div className={s.head}>
          <h2 id="similar-title" className="h2">Похожие вещи</h2>
          <Link to={`/catalog/${c.slug}`} className="link">Вся категория «{c.name}» <Icon name="arrow" size={18} /></Link>
        </div>
        <ul className={s.grid}>
          {similar.map((x) => <li key={x.slug}><ProductCard product={x} /></li>)}
        </ul>
      </section>

      <Recent current={p.slug} />
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const p = bySlug[slug]
  if (!p) return <NotFound />
  return <Product key={slug} p={p} />
}
