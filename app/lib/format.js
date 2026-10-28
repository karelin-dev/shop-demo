// Цены, склонения и телефон. Пробелы неразрывные, чтобы «3 490 ₽» не разрывалось на две строки.
const NBSP = ' '

export function num(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

export function rub(n) {
  return `${num(n)}${NBSP}₽`
}

// plural(5, ['вещь', 'вещи', 'вещей']) -> 'вещей'
export function plural(n, [one, few, many]) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return one
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few
  return many
}

export function things(n) {
  return `${n}${NBSP}${plural(n, ['вещь', 'вещи', 'вещей'])}`
}

// Маска телефона: +7 (916) 123-45-67. Первая 8 или 7 считается кодом страны.
export function phoneDigits(value) {
  let d = value.replace(/\D/g, '')
  if (d.startsWith('8') || d.startsWith('7')) d = d.slice(1)
  return d.slice(0, 10)
}

export function formatPhone(value) {
  const d = phoneDigits(value)
  if (!d) return ''
  let out = '+7 (' + d.slice(0, 3)
  if (d.length >= 3) out += ') ' + d.slice(3, 6)
  if (d.length >= 6) out += '-' + d.slice(6, 8)
  if (d.length >= 8) out += '-' + d.slice(8, 10)
  return out
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

export function dayMonth(date) {
  const d = new Date(date)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function time(date) {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
