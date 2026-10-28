import NotFound from '../components/NotFound.jsx'
import { seo } from '../lib/seo.js'

export const meta = () => seo({ title: 'Страница не найдена', description: 'Такой страницы в магазине нет.', noindex: true })

export default NotFound
