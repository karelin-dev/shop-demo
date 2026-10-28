import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

// Сайт живёт по адресу karelin-dev.github.io/shop-demo/, поэтому все пути начинаются с /shop-demo/
export default defineConfig({
  base: '/shop-demo/',
  plugins: [reactRouter()],
  server: { port: 3007 },
})
