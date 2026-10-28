import { Link } from 'react-router'
import Icon from '../components/Icon.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { bySlug, products } from '../data/catalog.js'
import { things } from '../lib/format.js'
import { seo } from '../lib/seo.js'
import { useShop } from '../shop.jsx'
import s from './orders.module.css'

export const meta = () => seo({ title: 'Избранное', description: 'Избранные вещи в демо-магазине «Полдень».', path: 'favorites', noindex: true })

export default function Favorites() {
  const { favs, ready, add } = useShop()
  const list = ready ? favs.map((x) => bySlug[x]).filter(Boolean) : []
  const inStock = list.filter((p) => p.stock)
  const popular = [...products].sort((a, b) => a.pop - b.pop).slice(0, 4)

  return (
    <div className="wrap client-page">
      <nav aria-label="Навигационная цепочка" className={s.crumbs}>
        <ol><li><Link to="/">Главная</Link></li><li><span aria-current="page">Избранное</span></li></ol>
      </nav>
      <div className={s.title}>
        <h1 className="h2">Избранное</h1>
        {list.length > 0 && <span className="muted">{things(list.length)}</span>}
        {inStock.length > 1 && (
          <button
            type="button"
            className="btn btn-light btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => add(inStock.map((p) => ({ slug: p.slug, variant: p.variants?.options[0].id })))}
          >
            <Icon name="bag" size={18} />Всё в корзину
          </button>
        )}
      </div>

      {!ready ? (
        <div style={{ minHeight: 300 }} aria-busy="true" />
      ) : list.length === 0 ? (
        <>
          <div className={s.empty}>
            <span className={s.emptyIc} style={{ background: 'var(--powder)' }}><Icon name="heart" size={32} /></span>
            <h2 className="h3">Здесь пока пусто</h2>
            <p className="muted">Нажмите на сердечко у товара, чтобы сохранить его. Избранное хранится в этом браузере.</p>
            <Link to="/catalog" className="btn btn-primary">В каталог</Link>
          </div>
          <h2 className="h3" style={{ margin: '56px 0 24px' }}>Чаще всего сохраняют</h2>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 45%), 1fr))', gap: '24px 16px' }}>
            {popular.map((p) => <li key={p.slug}><ProductCard product={p} /></li>)}
          </ul>
        </>
      ) : (
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 45%), 1fr))', gap: '24px 16px' }}>
          {list.map((p) => <li key={p.slug}><ProductCard product={p} /></li>)}
        </ul>
      )}
    </div>
  )
}
