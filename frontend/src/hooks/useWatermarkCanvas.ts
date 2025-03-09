import { useCallback, useEffect, useRef } from 'react'
import { WatermarkSettings, drawWatermark } from '../common/canvas'

export type { WatermarkSettings }

export interface UseWatermarkCanvasProps {
  width?: number
  height?: number
  onWatermarkGenerated: (imageData: string) => void
}

export function useWatermarkCanvas({
  width = 400,
  height = 300,
  onWatermarkGenerated,
}: UseWatermarkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
    }
  }, [width, height])

  const updateCanvas = useCallback(
    (settings: WatermarkSettings, useTransparentBlock = false) => {
      const canvas = canvasRef.current
      if (!canvas)
        return

      const imageData = drawWatermark(canvas, settings, useTransparentBlock)
      if (imageData)
        onWatermarkGenerated(imageData)
    },
    [onWatermarkGenerated],
  )

  return {
    canvasRef,
    updateCanvas,
  }
}