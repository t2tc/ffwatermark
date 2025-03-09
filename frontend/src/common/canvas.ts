export interface WatermarkSettings {
  text: string
  fontSize: number
  fontFamily: string
  opacity: number
  angle: number
  color: string
  horizontalDensity: number
  verticalDensity: number
}

export function drawTransparentBlock(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const blockSize = 10 // 棋盘格方块大小
  const lightColor = '#ffffff' // 浅色方块颜色
  const darkColor = '#e0e0e0' // 深色方块颜色

  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      ctx.fillStyle = ((x / blockSize + y / blockSize) % 2 === 0) ? lightColor : darkColor
      ctx.fillRect(x, y, blockSize, blockSize)
    }
  }
}

export function drawWatermark(
  canvas: HTMLCanvasElement,
  settings: WatermarkSettings,
  useTransparentBlock = false,
): string | null {
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return null

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制背景
  if (useTransparentBlock) {
    drawTransparentBlock(ctx, canvas.width, canvas.height)
  }
  else {
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // 设置水印样式
  ctx.font = `${settings.fontSize}px ${settings.fontFamily}`
  ctx.fillStyle = settings.color
  ctx.globalAlpha = settings.opacity

  // 计算文本大小
  const textMetrics = ctx.measureText(settings.text)
  const textWidth = textMetrics.width
  const textHeight = settings.fontSize

  // 移动到中心点并旋转
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((settings.angle * Math.PI) / 180)
  ctx.translate(-canvas.width / 2, -canvas.height / 2)

  // 计算水印间距
  const horizontalSpacing = canvas.width / (settings.horizontalDensity || 1)
  const verticalSpacing = canvas.height / (settings.verticalDensity || 1)

  // 计算起始位置，使水印整体居中
  const startX = (canvas.width - (settings.horizontalDensity - 1) * horizontalSpacing - textWidth) / 2
  const startY = (canvas.height - (settings.verticalDensity - 1) * verticalSpacing) / 2

  // 绘制水印网格
  for (let i = 0; i < settings.verticalDensity; i++) {
    for (let j = 0; j < settings.horizontalDensity; j++) {
      const x = startX + j * horizontalSpacing
      const y = startY + i * verticalSpacing + textHeight / 2
      ctx.fillText(settings.text, x, y)
    }
  }

  // 重置变换
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  // 生成图像数据
  return canvas.toDataURL('image/png')
}