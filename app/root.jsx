import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useMatches } from 'react-router'
import './styles/base.css'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import MiniCart from './components/MiniCart.jsx'
import { asset } from './lib/img.js'
import { ShopProvider, useShop } from './shop.jsx'
import rubikCyr from './assets/fonts/rubik-cyr.woff2?url'
import rubikLat from './assets/fonts/rubik-lat.woff2?url'
import unboundedCyr from './assets/fonts/unbounded-cyr.woff2?url'
import unboundedLat from './assets/fonts/unbounded-lat.woff2?url'

export const links = () => [
  { rel: 'icon', href: asset('favicon.svg'), type: 'image/svg+xml' },
  // кириллицу и цифры грузим сразу, иначе цены подменяются позже и сдвигают вёрстку (₽ встроен прямо в CSS)
  ...[unboundedCyr, unboundedLat, rubikCyr, rubikLat].map((href) => ({ rel: 'preload', href, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })),
]

export function Layout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FFFCF7" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function Toast() {
  const { toast, hideToast } = useShop()
  return (
    <div className="toast-zone" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action.run()
                hideToast()
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Страницы оформления показывают упрощённую шапку с шагами заказа (handle.step в модуле страницы)
function Shell({ children }) {
  const matches = useMatches()
  const step = matches.at(-1)?.handle?.step ?? null
  return (
    <>
      <a className="skip-link" href="#main">Перейти к содержимому</a>
      <Header step={step} />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer minimal={step !== null} />
      <MiniCart />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <ShopProvider>
      <Shell>
        <Outlet />
      </Shell>
    </ShopProvider>
  )
}

export function HydrateFallback() {
  return null
}

export function ErrorBoundary({ error }) {
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <ShopProvider>
      <Shell>
        <section className="wrap" style={{ padding: '80px 0 120px' }}>
          <h1 className="h2">{notFound ? 'Такой страницы нет' : 'Что-то пошло не так'}</h1>
          <p className="lead" style={{ margin: '16px 0 28px' }}>Попробуйте открыть каталог или вернуться на главную.</p>
          <a className="btn btn-primary" href={asset('catalog')}>В каталог</a>
        </section>
      </Shell>
    </ShopProvider>
  )
}
