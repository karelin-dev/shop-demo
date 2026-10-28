// Страница «не найдено»: для неизвестных адресов, товаров и категорий
import { Link } from 'react-router'
import ProductCard from './ProductCard.jsx'
import { products } from '../data/catalog.js'

const popular = [...products].sort((a, b) => a.pop - b.pop).slice(0, 4)

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingTop: 40 }}>
      <section style={{ padding: 'clamp(28px, 5vw, 56px)', borderRadius: 36, background: 'var(--sky)', display: 'grid', gap: 18, justifyItems: 'start' }}>
        <span className="eyebrow">Ошибка 404</span>
        <h1 className="h1">Такой страницы <span className="hl">нет</span></h1>
        <p className="lead" style={{ maxWidth: 560 }}>Возможно, ссылка устарела или в ней опечатка. Каталог и корзина на месте.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/catalog" className="btn btn-primary">В каталог</Link>
          <Link to="/" className="btn btn-white">На главную</Link>
        </div>
      </section>
      <h2 className="h3" style={{ margin: '56px 0 24px' }}>Чаще всего смотрят</h2>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 45%), 1fr))', gap: 20 }}>
        {popular.map((p) => <li key={p.slug}><ProductCard product={p} /></li>)}
      </ul>
    </div>
  )
}
