import { index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.jsx'),
  route('catalog/:category?', 'routes/catalog.jsx'),
  route('product/:slug', 'routes/product.jsx'),
  route('cart', 'routes/cart.jsx'),
  route('checkout', 'routes/checkout.jsx'),
  route('order', 'routes/order.jsx'),
  route('orders', 'routes/orders.jsx'),
  route('favorites', 'routes/favorites.jsx'),
  route('*', 'routes/not-found.jsx'),
]
