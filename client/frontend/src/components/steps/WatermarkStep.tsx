import { WatermarkEditor } from '../WatermarkEditor'

interface WatermarkStepProps {
  onWatermarkGenerated: (imageData: string) => void
  width?: number
  height?: number
}

export function WatermarkStep({ onWatermarkGenerated, width = 400, height = 200 }: WatermarkStepProps) {
  return (
    <WatermarkEditor
      onWatermarkGenerated={onWatermarkGenerated}
      width={width}
      height={height}
    />
  )
}