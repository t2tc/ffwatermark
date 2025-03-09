import { useCallback, useEffect, useState } from 'react'
import { useWatermarkCanvas, type WatermarkSettings } from '../hooks/useWatermarkCanvas'

interface WatermarkEditorProps {
  onWatermarkGenerated: (imageData: string) => void
  width?: number
  height?: number
}

export function WatermarkEditor({ onWatermarkGenerated, width = 640, height = 480 }: WatermarkEditorProps) {
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: '水印文本',
    fontSize: 24,
    fontFamily: 'Arial',
    opacity: 0.5,
    angle: -30,
    color: '#000000',
    horizontalDensity: 3,
    verticalDensity: 3,
  })

  const [useTransparentBlock, setUseTransparentBlock] = useState(false)
  const [canvasWidth, setCanvasWidth] = useState(width)
  const [canvasHeight, setCanvasHeight] = useState(height)

  const { canvasRef, updateCanvas } = useWatermarkCanvas({
    width: canvasWidth,
    height: canvasHeight,
    onWatermarkGenerated,
  })

  useEffect(() => {
    updateCanvas(settings, useTransparentBlock)
  }, [settings, updateCanvas, useTransparentBlock])

  const handleSettingChange = useCallback((key: keyof WatermarkSettings, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border rounded bg-gray-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">画布宽度</label>
          <input
            type="number"
            value={canvasWidth}
            onChange={e => setCanvasWidth(Number(e.target.value))}
            min="200"
            max="1920"
            className="px-3 py-2 border rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">画布高度</label>
          <input
            type="number"
            value={canvasHeight}
            onChange={e => setCanvasHeight(Number(e.target.value))}
            min="200"
            max="1080"
            className="px-3 py-2 border rounded"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">水印文本</label>
          <input
            type="text"
            value={settings.text}
            onChange={e => handleSettingChange('text', e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">字体大小</label>
          <input
            type="number"
            value={settings.fontSize}
            onChange={e => handleSettingChange('fontSize', Number(e.target.value))}
            min="12"
            max="72"
            className="px-3 py-2 border rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">透明度</label>
          <input
            type="range"
            value={settings.opacity}
            onChange={e => handleSettingChange('opacity', Number(e.target.value))}
            min="0"
            max="1"
            step="0.1"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">旋转角度</label>
          <input
            type="range"
            value={settings.angle}
            onChange={e => handleSettingChange('angle', Number(e.target.value))}
            min="-180"
            max="180"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">字体颜色</label>
          <input
            type="color"
            value={settings.color}
            onChange={e => handleSettingChange('color', e.target.value)}
            className="w-full h-10 p-1 border rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">横向密度</label>
          <input
            type="range"
            value={settings.horizontalDensity}
            onChange={e => handleSettingChange('horizontalDensity', Number(e.target.value))}
            min="1"
            max="10"
            step="1"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">纵向密度</label>
          <input
            type="range"
            value={settings.verticalDensity}
            onChange={e => handleSettingChange('verticalDensity', Number(e.target.value))}
            min="1"
            max="10"
            step="1"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">背景样式</label>
          <button
            onClick={() => setUseTransparentBlock(prev => !prev)}
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            {useTransparentBlock ? '使用纯色背景' : '使用棋盘格背景'}
          </button>
        </div>
      </div>
    </div>
  )
}