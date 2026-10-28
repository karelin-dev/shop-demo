"""Шрифты сайта: Unbounded (заголовки, цены) и Rubik (текст) из пакетов Fontsource.

Для каждого шрифта три файла woff2:
- cyr: кириллица как есть;
- lat: из латиницы только нужное (буквы, цифры, кавычки, тире, ×, Ø, ·);
- rub: один знак ₽ (в Fontsource он лежит в большом наборе latin-ext).
Плюс запасные шрифты с подобранными метриками (size-adjust, ascent-override),
чтобы текст не прыгал, пока грузится основной шрифт. Результат: app/assets/fonts и app/styles/fonts.css.

Запуск: python scripts/fonts.py  (нужны fonttools и brotli)
"""
import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'app' / 'assets' / 'fonts'
CSS = ROOT / 'app' / 'styles' / 'fonts.css'
ARIAL = Path('C:/Windows/Fonts/arial.ttf')

FAMILIES = {
    # имя: (пакет, файл без подмножества, начертание для расчёта метрик, набор латиницы)
    'Unbounded': ('unbounded', 'unbounded', 500, 'DIGITS'),
    'Rubik': ('rubik', 'rubik', 400, 'LATIN'),
}
LATIN = 'U+0020-007E,U+00A0,U+00AB,U+00B0,U+00B7,U+00BB,U+00D7,U+00D8,U+00F8,U+2013,U+2014,U+2019,U+201C-201E,U+2026,U+2212'
# Unbounded стоит в заголовках и ценах: латинские буквы там не встречаются, хватает цифр и знаков
DIGITS = 'U+0020-0040,U+005B-0060,U+007B-007E,U+00A0,U+00AB,U+00B0,U+00B7,U+00BB,U+00D7,U+00D8,U+2013,U+2014,U+2019,U+201C-201E,U+2026,U+2212'
RUB = 'U+20BD'
CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116'
# частый русский текст для расчёта средней ширины букв
SAMPLE = ('Керамика, лён и лампы от небольших мастерских. Простые вещи для каждого дня: от миски '
          'до льняного белья. Бесплатная доставка от 5 000 рублей, возврат 30 дней, оплата при получении.')


def make_subset(src, dst, unicodes):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'mark', 'mkmk']  # кернинг и диакритика, остальные функции шрифта сайту не нужны
    opts.notdef_outline = True
    font = TTFont(src)
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=subset.parse_unicodes(unicodes))
    sub.subset(font)
    font.flavor = 'woff2'
    font.save(dst)
    return dst.stat().st_size


def avg_width(font, text):
    cmap = font.getBestCmap()
    hmtx = font['hmtx']
    widths = [hmtx[cmap[ord(ch)]][0] for ch in text if ord(ch) in cmap]
    return sum(widths) / len(widths) / font['head'].unitsPerEm


def metrics(path, wght):
    font = TTFont(path)
    if 'fvar' in font:
        font = instancer.instantiateVariableFont(font, {'wght': wght})
    return font


def pct(x):
    return f'{x * 100:.2f}%'


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    arial = TTFont(ARIAL)
    arial_w = avg_width(arial, SAMPLE)
    css = ['/* Создано scripts/fonts.py: шрифты сайта и запасные шрифты с подобранными метриками */']
    for family, (pkg, base, wght, lat) in FAMILIES.items():
        files = ROOT / 'node_modules' / '@fontsource-variable' / pkg / 'files'
        slug = family.lower()
        parts = [
            ('cyr', files / f'{base}-cyrillic-wght-normal.woff2', CYR),
            ('lat', files / f'{base}-latin-wght-normal.woff2', DIGITS if lat == 'DIGITS' else LATIN),
            ('rub', files / f'{base}-latin-ext-wght-normal.woff2', RUB),
        ]
        for part, src, ranges in parts:
            size = make_subset(src, OUT / f'{slug}-{part}.woff2', ranges)
            print(f'{slug}-{part}.woff2: {size} байт')
            css.append(f"@font-face{{font-family:'{family}';font-style:normal;font-display:swap;font-weight:100 900;"
                       f"src:url('../assets/fonts/{slug}-{part}.woff2') format('woff2');unicode-range:{ranges}}}")
        # метрики считаем по кириллице и латинице вместе
        font_cyr = metrics(files / f'{base}-cyrillic-wght-normal.woff2', wght)
        font_lat = metrics(files / f'{base}-latin-wght-normal.woff2', wght)
        cmap_text = ''.join(ch for ch in SAMPLE if ord(ch) in font_cyr.getBestCmap() or ord(ch) in font_lat.getBestCmap())
        w_cyr = avg_width(font_cyr, ''.join(ch for ch in cmap_text if ord(ch) in font_cyr.getBestCmap() and ord(ch) > 0x3ff))
        w_lat = avg_width(font_lat, ''.join(ch for ch in cmap_text if ord(ch) <= 0x3ff))
        n_cyr = sum(1 for ch in cmap_text if ord(ch) > 0x3ff)
        w = (w_cyr * n_cyr + w_lat * (len(cmap_text) - n_cyr)) / len(cmap_text)
        size_adjust = w / arial_w
        hhea, upm = font_lat['hhea'], font_lat['head'].unitsPerEm
        asc = hhea.ascent / upm / size_adjust
        desc = abs(hhea.descent) / upm / size_adjust
        gap = hhea.lineGap / upm / size_adjust
        css.append(f"@font-face{{font-family:'{family} Fallback';src:local('Arial'),local('Liberation Sans'),local('Roboto');"
                   f"size-adjust:{pct(size_adjust)};ascent-override:{pct(asc)};descent-override:{pct(desc)};line-gap-override:{pct(gap)}}}")
        print(f'{family} Fallback: size-adjust {pct(size_adjust)}')
    CSS.write_text('\n'.join(css) + '\n', encoding='utf-8')
    print('fonts.css: готово')


if __name__ == '__main__':
    main()
