import { useEffect, useState } from 'react'
import { colors } from '../data/catalog.js'
import { MATERIALS, PRICE_STEPS } from '../lib/filters.js'
import { num } from '../lib/format.js'
import s from './Filters.module.css'

const LIMIT = 12000
const STEP = 100

function PriceFilter({ f, update, id }) {
  const [min, setMin] = useState(f.min ?? 0)
  const [max, setMax] = useState(f.max ?? LIMIT)
  useEffect(() => {
    setMin(f.min ?? 0)
    setMax(f.max ?? LIMIT)
  }, [f.min, f.max])

  const commit = (lo, hi) => {
    const a = Math.max(0, Math.min(lo, hi))
    const b = Math.min(LIMIT, Math.max(lo, hi))
    update({ min: a > 0 ? String(a) : null, max: b < LIMIT ? String(b) : null })
  }
  const parse = (v) => Number(String(v).replace(/\D/g, '')) || 0
  const onKey = (e) => {
    if (e.key === 'Enter') e.currentTarget.blur()
  }

  return (
    <fieldset className={s.group}>
      <legend className={s.title}>Цена, ₽</legend>
      <div className={s.prices}>
        <label>
          <span className="visually-hidden">Цена от</span>
          <span aria-hidden="true">от</span>
          <input
            className="input num"
            inputMode="numeric"
            value={min ? num(min) : ''}
            placeholder="0"
            onChange={(e) => setMin(parse(e.target.value))}
            onBlur={() => commit(min, max)}
            onKeyDown={onKey}
            id={`${id}-min`}
          />
        </label>
        <label>
          <span className="visually-hidden">Цена до</span>
          <span aria-hidden="true">до</span>
          <input
            className="input num"
            inputMode="numeric"
            value={max < LIMIT ? num(max) : ''}
            placeholder={num(LIMIT)}
            onChange={(e) => setMax(parse(e.target.value) || LIMIT)}
            onBlur={() => commit(min, max)}
            onKeyDown={onKey}
            id={`${id}-max`}
          />
        </label>
      </div>
      <div className={s.range} style={{ '--a': `${(min / LIMIT) * 100}%`, '--b': `${(max / LIMIT) * 100}%` }}>
        <input
          type="range" min="0" max={LIMIT} step={STEP} value={min} aria-label="Минимальная цена"
          aria-valuetext={`от ${num(min)} ₽`}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max - STEP))}
          onPointerUp={() => commit(min, max)} onKeyUp={() => commit(min, max)}
        />
        <input
          type="range" min="0" max={LIMIT} step={STEP} value={max} aria-label="Максимальная цена"
          aria-valuetext={`до ${num(max)} ₽`}
          onChange={(e) => setMax(Math.max(Number(e.target.value), min + STEP))}
          onPointerUp={() => commit(min, max)} onKeyUp={() => commit(min, max)}
        />
      </div>
      <div className={s.quick}>
        {PRICE_STEPS.map((v) => (
          <button
            key={v}
            type="button"
            className="chip"
            aria-pressed={f.max === v && f.min === null}
            onClick={() => update(f.max === v && f.min === null ? { min: null, max: null } : { min: null, max: String(v) })}
          >
            до {num(v)}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default function Filters({ f, facets, update, onReset, id }) {
  const [allMat, setAllMat] = useState(false)
  const toggle = (key, value) => {
    const list = f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value]
    update({ [key]: list.length ? list.join(',') : null })
  }
  const mats = MATERIALS.filter((m) => facets.mat[m.id] || f.mat.includes(m.id))
  const shownMats = allMat ? mats : mats.slice(0, 6)

  return (
    <div className={s.filters}>
      <PriceFilter f={f} update={update} id={id} />

      <fieldset className={s.group}>
        <legend className={s.title}>Материал</legend>
        <div className={s.checks}>
          {shownMats.map((m) => (
            <label key={m.id} className="check">
              <input type="checkbox" checked={f.mat.includes(m.id)} onChange={() => toggle('mat', m.id)} />
              <span className={s.checkName}>{m.name}</span>
              <span className={s.count}>{facets.mat[m.id] || 0}</span>
            </label>
          ))}
        </div>
        {mats.length > 6 && (
          <button type="button" className={s.more} onClick={() => setAllMat(!allMat)} aria-expanded={allMat}>
            {allMat ? 'Свернуть' : `Ещё ${mats.length - 6}`}
          </button>
        )}
      </fieldset>

      <fieldset className={s.group}>
        <legend className={s.title}>Цвет</legend>
        <div className={s.colors}>
          {colors.map((c) => {
            const count = facets.color[c.id] || 0
            const on = f.color.includes(c.id)
            return (
              <label key={c.id} className={s.color} title={`${c.name}: ${count}`}>
                <input type="checkbox" checked={on} disabled={!count && !on} onChange={() => toggle('color', c.id)} />
                <span className={s.dot} style={{ background: c.hex }} aria-hidden="true" />
                <span className="visually-hidden">{c.name}, {count}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className={`${s.group} ${s.switches}`}>
        <legend className="visually-hidden">Дополнительно</legend>
        <label className="switch">Только в наличии<input type="checkbox" checked={f.stock} onChange={() => update({ stock: f.stock ? null : '1' })} /></label>
        <label className="switch">Со скидкой<input type="checkbox" checked={f.sale} onChange={() => update({ sale: f.sale ? null : '1' })} /></label>
        <label className="switch">Новинки<input type="checkbox" checked={f.isNew} onChange={() => update({ new: f.isNew ? null : '1' })} /></label>
      </fieldset>

      <button type="button" className={`btn btn-light btn-sm btn-block ${s.reset}`} onClick={onReset}>Сбросить фильтры</button>
    </div>
  )
}
