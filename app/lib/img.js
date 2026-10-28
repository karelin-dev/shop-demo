// Пути к картинкам с учётом адреса сайта (/shop-demo/ на GitHub Pages).
export const BASE = import.meta.env.BASE_URL
export const SITE = 'https://karelin-dev.github.io/shop-demo/'

export const asset = (path) => BASE + path

// Квадратное фото товара: 400, 800 и 1200 px, браузер берёт нужное по sizes
export function productImg(name, sizes) {
  return {
    src: asset(`img/p/${name}-800.webp`),
    srcSet: [400, 800, 1200].map((w) => `${asset(`img/p/${name}-${w}.webp`)} ${w}w`).join(', '),
    sizes,
  }
}

export const fullImg = (name) => asset(`img/p/${name}-full.webp`)
export const thumbImg = (name) => asset(`img/p/${name}-400.webp`)
