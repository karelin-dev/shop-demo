import { useCallback, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import Filters from '../components/Filters.jsx'
import Icon from '../components/Icon.jsx'
import NotFound from '../components/NotFound.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { categories, categoryBySlug, products } from '../data/catalog.js'
import { applyFilters, chips, facets, readFilters, SORTS, suggestion } from '../lib/filters.js'
import { things } from '../lib/format.js'
import { SITE } from '../lib/img.js'
import { seo } from '../lib/seo.js'
import useDialog from '../lib/useDialog.js'
import { useHydrated } from '../shop.jsx'
import s from './catalog.module.css'

const PAGE = 12
const listText = (xs) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} и ${xs.at(-1)}` : xs[0])
const NO_PARAMS = new URLSearchParams()

export const meta = ({ params }) => {
  const c = categoryBySlug[params.category]
  if (params.category && !c) return seo({ title: 'Страница не найдена', description: 'Такой категории нет.', noindex: true })
  const path = c ? `catalog/${c.slug}` : 'catalog'
  const crumbs = [{ name: 'Главная', url: SITE }, { name: 'Каталог', url: `${SITE}catalog/` }]
  if (c) crumbs.push({ name: c.name, url: `${SITE}${path}/` })
  return seo({
    title: c ? c.name : 'Каталог',
    description: c
      ? `${c.title} в демо-магазине «Полдень»: фильтры по цене, материалу и цвету, доставка от 190 ₽, бесплатно от 5 000 ₽.`
      : 'Каталог «Полдня»: посуда, текстиль, свет, декор, вещи для кухни и ванной. Фильтры по цене, материалу и цвету.',
    path,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x.name, item: x.url })),
    },
  })
}

function FilterSheet({ open, onClose, count, children }) {
  const ref = useDialog(open, onClose)
  return (
    <dialog ref={ref} className={s.sheet} aria-labelledby="sheet-title">
      {open && (
        <div className={s.sheetBody}>
          <div className={s.sheetTop}>
            <h2 id="sheet-title" className="h3">Фильтры</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть фильтры"><Icon name="close" /></button>
          </div>
          {children}
          <div className={s.sheetFoot}>
            <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
              {count ? `Показать ${things(count)}` : 'Ничего не нашлось'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

export default function Catalog() {
  const { category } = useParams()
  const cat = category ? categoryBySlug[category] : null
  const hydrated = useHydrated()
  const [params, setParams] = useSearchParams()
  const [shown, setShown] = useState(PAGE)
  const [sheet, setSheet] = useState(false)
  const closeSheet = useCallback(() => setSheet(false), [])

  // до гидратации показываем каталог без фильтров, как в собранном заранее HTML
  const current = hydrated ? params : NO_PARAMS
  const f = readFilters(current)
  const list = applyFilters(f, category)
  const active = chips(f)
  const query = current.toString()

  const update = (changes) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    setShown(PAGE)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const reset = () => update(Object.fromEntries([...params.keys()].filter((k) => k !== 'sort').map((k) => [k, null])))

  if (category && !cat) return <NotFound />

  const hint = list.length === 0 ? suggestion(f, category) : null
  const filters = <Filters f={f} facets={facets(f, category)} update={update} onReset={reset} id={sheet ? 'm' : 'd'} />

  return (
    <div className="wrap">
      <nav aria-label="Навигационная цепочка" className={s.crumbs}>
        <ol>
          <li><Link to="/">Главная</Link></li>
          <li>{cat ? <Link to={`/catalog${query ? `?${query}` : ''}`}>Каталог</Link> : <span aria-current="page">Каталог</span>}</li>
          {cat && <li><span aria-current="page">{cat.name}</span></li>}
        </ol>
      </nav>
      <div className={s.title}>
        <h1 className="h2">{cat ? cat.name : f.q ? `Поиск: «${f.q}»` : 'Каталог'}</h1>
        <span className="muted">{cat ? cat.title : `${things(products.length)} для дома`}</span>
      </div>
      <nav className={s.cats} aria-label="Категории">
        <Link to={`/catalog${query ? `?${query}` : ''}`} className="chip" aria-current={!cat ? 'page' : undefined}>
          Все <small>{products.length}</small>
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/catalog/${c.slug}${query ? `?${query}` : ''}`}
            className="chip"
            style={cat?.slug === c.slug ? undefined : { background: c.color }}
            aria-current={cat?.slug === c.slug ? 'page' : undefined}
          >
            {c.name} <small>{products.filter((p) => p.category === c.slug).length}</small>
          </Link>
        ))}
      </nav>

      <div className={s.layout}>
        <aside className={s.side} aria-label="Фильтры">{!sheet && filters}</aside>

        <section aria-labelledby="results-title">
          <h2 id="results-title" className="visually-hidden">Товары</h2>
          <div className={s.toolbar}>
            <button type="button" className={`btn btn-light btn-sm ${s.openSheet}`} onClick={() => setSheet(true)}>
              <Icon name="filter" size={18} />Фильтры{active.length ? ` · ${active.length}` : ''}
            </button>
            {active.length > 0 && (
              <div className={s.active}>
                {active.map((c) => (
                  <button key={c.id} type="button" className="chip" onClick={() => update(c.drop)} aria-label={`Убрать фильтр: ${c.label}`}>
                    {c.label} <Icon name="close" size={14} />
                  </button>
                ))}
                <button type="button" className={`chip ${s.resetAll}`} onClick={reset}>Сбросить всё</button>
              </div>
            )}
            <div className={s.sort}>
              <span className={s.found} aria-live="polite">Найдено {list.length}</span>
              <label className={s.sortLabel} htmlFor="sort">Сначала</label>
              <select id="sort" className={`input ${s.select}`} value={f.sort} onChange={(e) => update({ sort: e.target.value === 'popular' ? null : e.target.value })}>
                {SORTS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
          </div>

          {list.length > 0 ? (
            <>
              <ul className={s.grid}>
                {list.slice(0, shown).map((p, i) => (
                  <li key={p.slug}><ProductCard product={p} priority={i === 0} /></li>
                ))}
              </ul>
              {list.length > shown && (
                <div className={s.more}>
                  <p className="muted">Показано {shown} из {list.length}</p>
                  <div className={s.progress}><i style={{ width: `${(shown / list.length) * 100}%` }} /></div>
                  <button type="button" className="btn btn-outline" onClick={() => setShown(shown + PAGE)}>
                    Показать ещё {Math.min(PAGE, list.length - shown)}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={s.empty}>
              <span className={s.emptyIc}><Icon name="search" size={32} /></span>
              <h3 className="h3">Ничего не нашлось</h3>
              <p className="muted">
                {active.length ? `С условиями ${listText(active.map((c) => `«${c.label}»`))} вещей нет.` : 'В этой категории пока пусто.'}
                {hint ? ' Можно немного ослабить условия:' : ''}
              </p>
              {hint && <button type="button" className="btn btn-primary" onClick={() => update(hint.set)}>{hint.label}</button>}
              <button type="button" className="btn btn-light" onClick={reset}>Сбросить фильтры</button>
            </div>
          )}
        </section>
      </div>

      <FilterSheet open={sheet} onClose={closeSheet} count={list.length}>{sheet && filters}</FilterSheet>
    </div>
  )
}
