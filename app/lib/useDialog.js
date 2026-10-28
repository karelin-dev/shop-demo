import { useEffect, useRef } from 'react'

// Нативный <dialog>: браузер сам держит фокус внутри окна, закрывает по Esc
// и возвращает фокус на кнопку, которая окно открыла. Здесь только связь с состоянием React
// и закрытие кликом по затемнённому фону.
export default function useDialog(open, onClose) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onCancel = (e) => {
      e.preventDefault()
      onClose()
    }
    const onClick = (e) => {
      if (e.target === el) onClose()
    }
    el.addEventListener('cancel', onCancel)
    el.addEventListener('click', onClick)
    return () => {
      el.removeEventListener('cancel', onCancel)
      el.removeEventListener('click', onClick)
    }
  }, [onClose])

  return ref
}
