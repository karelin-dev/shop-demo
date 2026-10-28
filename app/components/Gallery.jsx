import { useCallback, useEffect, useRef, useState } from 'react'
import { fullImg, productImg, thumbImg } from '../lib/img.js'
import useDialog from '../lib/useDialog.js'
import Icon from './Icon.jsx'
import s from './Gallery.module.css'

// Фото на весь экран: стрелки, клавиатура, светлый фон
function Lightbox({ photos, index, setIndex, open, onClose }) {
  const ref = useDialog(open, onClose)
  const go = useCallback((d) => setIndex((i) => (i + d + photos.length) % photos.length), [photos.length, setIndex])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go])
  const photo = photos[index]
  return (
    <dialog ref={ref} className={s.lightbox} aria-label="Фото товара">
      {open && (
        <>
          <img className={s.full} src={fullImg(photo.src)} alt={photo.alt} />
          <button type="button" className={`icon-btn ${s.close}`} onClick={onClose} aria-label="Закрыть"><Icon name="close" /></button>
          {photos.length > 1 && (
            <>
              <button type="button" className={`icon-btn ${s.lbPrev}`} onClick={() => go(-1)} aria-label="Предыдущее фото"><Icon name="left" /></button>
              <button type="button" className={`icon-btn ${s.lbNext}`} onClick={() => go(1)} aria-label="Следующее фото"><Icon name="right" /></button>
              <p className={s.lbCount} aria-live="polite">{index + 1} из {photos.length}</p>
            </>
          )}
        </>
      )}
    </dialog>
  )
}

export default function Gallery({ photos, index, onIndex, label }) {
  const track = useRef(null)
  const target = useRef(null) // куда едет прокрутка, запущенная кнопкой: промежуточные кадры не считаем выбором
  const [zoom, setZoom] = useState(false)
  const close = useCallback(() => setZoom(false), [])

  // при смене варианта (цвета) прокручиваем к его фото
  useEffect(() => {
    const el = track.current
    if (el && Math.round(el.scrollLeft / el.clientWidth) !== index) {
      target.current = index
      el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
    }
  }, [index])

  const onScroll = () => {
    const el = track.current
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (target.current !== null) {
      if (i === target.current) target.current = null
      return
    }
    if (i !== index) onIndex(i)
  }
  const go = (d) => onIndex(Math.max(0, Math.min(photos.length - 1, index + d)))

  return (
    <div className={s.gallery}>
      <div className={s.main}>
        <ul className={s.track} ref={track} onScroll={onScroll} aria-label={`Фото: ${label}`}>
          {photos.map((ph, i) => (
            <li key={ph.src}>
              <button type="button" className={s.zoom} onClick={() => setZoom(true)} aria-label={`Открыть фото ${i + 1} на весь экран`}>
                <img
                  {...productImg(ph.src, '(max-width: 1099px) 100vw, 56vw')}
                  alt={ph.alt}
                  width="1200"
                  height="1200"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
        {photos.length > 1 && (
          <>
            <button type="button" className={`icon-btn ${s.prev}`} onClick={() => go(-1)} disabled={index === 0} aria-label="Предыдущее фото"><Icon name="left" size={20} /></button>
            <button type="button" className={`icon-btn ${s.next}`} onClick={() => go(1)} disabled={index === photos.length - 1} aria-label="Следующее фото"><Icon name="right" size={20} /></button>
            <span className={s.count} aria-hidden="true">{index + 1} / {photos.length}</span>
            <span className={s.dots} aria-hidden="true">{photos.map((ph, i) => <i key={ph.src} className={i === index ? s.on : ''} />)}</span>
          </>
        )}
        <span className={s.hintZoom} aria-hidden="true"><Icon name="expand" size={18} /></span>
      </div>
      {photos.length > 1 && (
        <ul className={s.thumbs} aria-label="Миниатюры">
          {photos.map((ph, i) => (
            <li key={ph.src}>
              <button type="button" className={i === index ? s.thumbOn : ''} onClick={() => onIndex(i)} aria-label={`Фото ${i + 1}`} aria-current={i === index}>
                <img src={thumbImg(ph.src)} alt="" width="96" height="96" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Lightbox photos={photos} index={index} setIndex={(f) => onIndex(typeof f === 'function' ? f(index) : f)} open={zoom} onClose={close} />
    </div>
  )
}
