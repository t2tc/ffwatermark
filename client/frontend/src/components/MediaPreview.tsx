import { useEffect, useRef } from 'react'

interface MediaPreviewProps {
  file: File
  className?: string
}

export function MediaPreview({ file, className = '' }: MediaPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!file || !previewRef.current) return

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    if (!isVideo && !isImage) return

    const element = isVideo
      ? document.createElement('video')
      : document.createElement('img')

    if (isVideo) {
      element.setAttribute('controls', '')
      element.setAttribute('controlsList', 'nodownload')
    }

    element.className = 'max-w-full max-h-[300px] rounded-lg'
    element.src = URL.createObjectURL(file)

    // 清除之前的预览
    while (previewRef.current.firstChild) {
      previewRef.current.firstChild.remove()
    }

    previewRef.current.appendChild(element)

    return () => {
      URL.revokeObjectURL(element.src)
    }
  }, [file])

  return (
    <div ref={previewRef} className={`flex justify-center items-center ${className}`} />
  )
}