import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: number | string
  maskClosable?: boolean
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  width = 500,
  maskClosable = true,
  className = '',
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (maskClosable && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" />

      {/* 对话框 */}
      <div
        ref={dialogRef}
        className={`relative bg-white rounded-lg shadow-xl transform transition-all duration-300 ${className}`}
        style={{ width }}
      >
        {/* 标题栏 */}
        {title && (
          <div className="px-6 py-4 border-b">
            <div className="text-lg font-medium">{title}</div>
          </div>
        )}

        {/* 内容区 */}
        <div className="px-6 py-4">{children}</div>

        {/* 底部操作区 */}
        {footer && (
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            {footer}
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          <div className="i-carbon-close text-xl" />
        </button>
      </div>
    </div>,
    document.body,
  )
}