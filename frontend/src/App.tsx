import { useState } from 'react'
import { StepProgress } from './components/StepProgress'
import { SelectFileStep } from './components/steps/SelectFileStep'
import { WatermarkStep } from './components/steps/WatermarkStep'
import { ExecuteStep } from './components/steps/ExecuteStep'
import { type TabType, steps } from './common/types'

function App() {
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('files')
  const [outputDir, setOutputDir] = useState<string>('')

  return (
    <div className="container mx-auto px-4 py-8">
      <StepProgress
        steps={steps}
        activeStep={activeTab}
        onStepClick={(stepId) => setActiveTab(stepId as TabType)}
      />

      <div className="mt-16 space-y-6">
        {activeTab === 'files' && (
          <SelectFileStep
            onFilesSelected={setSelectedFiles}
            selectedFiles={selectedFiles}
          />
        )}

        {activeTab === 'watermark' && (
          <WatermarkStep
            onWatermarkGenerated={setWatermarkImage}
            width={400}
            height={200}
          />
        )}

        {activeTab === 'execute' && (
          <ExecuteStep
            selectedFiles={selectedFiles}
            watermarkImage={watermarkImage}
            outputDir={outputDir}
            onOutputDirChange={setOutputDir}
          />
        )}
      </div>
    </div>
  )
}

export default App
