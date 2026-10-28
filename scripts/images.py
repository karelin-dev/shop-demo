"""Нарезка фото для сайта: WebP нужных размеров из исходников 1800 px.

Запуск: python scripts/images.py <папка с исходными jpg>
Исходники (фото с Unsplash, авторы в CREDITS.md) в репозиторий не входят, только результат в public/img.
"""
import sys
from pathlib import Path

from PIL import Image, ImageOps

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'public' / 'img'

# фото товаров: файл -> центр кадра для квадратной обрезки (x, y от 0 до 1)
PRODUCTS = {
    'mug-krapinka': (0.5, 0.62), 'plate-kromka': (0.5, 0.5), 'plates-pesok': (0.5, 0.6),
    'salad-bowl-oliva': (0.5, 0.5), 'bowl-moloko': (0.5, 0.5), 'teapot': (0.5, 0.5),
    'glasses-1': (0.5, 0.4), 'glasses-2': (0.5, 0.5),
    'tablecloth-1': (0.4, 0.5), 'tablecloth-2': (0.3, 0.5), 'tablecloth-3': (0.6, 0.5),
    'napkins-1': (0.5, 0.6), 'napkins-2': (0.5, 0.6), 'napkins-3': (0.5, 0.6),
    'throw-ovsyanka': (0.5, 0.5), 'bedding-1': (0.5, 0.5), 'bedding-2': (0.5, 0.5),
    'pillowcases-1': (0.5, 0.45), 'pillowcases-2': (0.5, 0.5), 'pillowcases-3': (0.5, 0.5),
    'lamp-vanil': (0.58, 0.5), 'candle-amber': (0.5, 0.58), 'candles-set': (0.45, 0.5),
    'candlesticks': (0.5, 0.62), 'pendant-rattan': (0.5, 0.45),
    'vases-glina-1': (0.5, 0.55), 'vases-glina-2': (0.5, 0.55), 'vases-glina-3': (0.5, 0.55),
    'vase-ring': (0.5, 0.5), 'basket': (0.5, 0.55), 'mirror': (0.5, 0.45), 'dried-flowers': (0.5, 0.5),
    'board': (0.5, 0.5), 'jars-1': (0.5, 0.6), 'jars-2': (0.5, 0.5), 'french-press': (0.45, 0.5),
    'towels': (0.5, 0.6), 'dispenser-amber': (0.62, 0.5), 'dispenser-olive': (0.5, 0.5),
}
# круглые фото категорий
CATEGORIES = {
    'posuda': ('cat-tableware', (0.45, 0.5)), 'tekstil': ('napkins-1', (0.5, 0.6)), 'svet': ('lamp-vanil', (0.58, 0.5)),
    'dekor': ('vase-ring', (0.5, 0.5)), 'kuhnya': ('jars-1', (0.5, 0.62)), 'vannaya': ('towels', (0.5, 0.6)),
}


def load(name):
    return Image.open(SRC / f'{name}.jpg').convert('RGB')


def save(img, path, quality=74):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=quality, method=6)


def fit(img, w, h, center=(0.5, 0.5)):
    return ImageOps.fit(img, (w, h), Image.LANCZOS, centering=center)


def width(img, w):
    return img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)


# товары: квадраты для карточек и галереи, полный кадр для просмотра на весь экран
for name, center in PRODUCTS.items():
    img = load(name)
    for w in (400, 800, 1200):
        save(fit(img, w, w, center), OUT / 'p' / f'{name}-{w}.webp', 72)
    save(width(img, 1400), OUT / 'p' / f'{name}-full.webp', 74)

# первый экран: фото в арке
hero = load('hero')
for w, h in ((600, 650), (1100, 1190)):
    save(fit(hero, w, h, (0.5, 0.6)), OUT / f'hero-{w}.webp')

# «Собрать стол» и «Как мы выбираем вещи»
look = load('table-look')
for w, h in ((800, 630), (1400, 1100)):
    save(fit(look, w, h), OUT / f'look-{w}.webp')
pottery = load('pottery')
for w, h in ((520, 620), (960, 1140)):
    save(fit(pottery, w, h), OUT / f'pottery-{w}.webp')

# категории: круги 120 px (240 для экранов с высокой плотностью)
for slug, (name, center) in CATEGORIES.items():
    save(fit(load(name), 240, 240, center), OUT / 'cat' / f'{slug}.webp', 76)

# превью ссылки в соцсетях и мессенджерах
fit(hero, 1200, 630, (0.5, 0.55)).save(OUT.parent / 'og.jpg', quality=82, optimize=True, progressive=True)
print('готово:', sum(1 for _ in OUT.rglob('*.webp')), 'webp')
