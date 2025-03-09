import { useState } from 'react'
import { processMedia, getProcessStatus } from '../../common/api'
import { FileList } from '../FileList'

interface ExecuteStepProps {
  selectedFiles: File[]
  watermarkImage: string | null
  outputDir: string
  onOutputDirChange: (dir: string) => void
}

export function ExecuteStep({
  selectedFiles,
  watermarkImage,
  outputDir,
  onOutputDirChange,
}: ExecuteStepProps) {
  const [taskId, setTaskId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">输出目录</label>
        <input
          type="text"
          value={outputDir}
          onChange={e => onOutputDirChange(e.target.value)}
          placeholder="请输入保存文件的目录路径"
          className="px-3 py-2 border rounded"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">任务信息</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>选择的文件数量：{selectedFiles.length}</p>
          <p>水印文本：{watermarkImage ? '已设置' : '未设置'}</p>
          <p>输出目录：{outputDir || '未设置'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <FileList files={selectedFiles} />

        {taskId && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">处理进度</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            {status && (
              <p className="mt-2 text-sm text-gray-600">
                状态: {status}
              </p>
            )}
            {error && (
              <p className="mt-2 text-sm text-red-500">
                错误: {error}
              </p>
            )}
          </div>
        )}

        <div className="text-center">
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!watermarkImage || selectedFiles.length === 0 || !outputDir || !!taskId}
            onClick={async () => {
              try {
                const request = {
                  sourcePath: selectedFiles[0].name,
                  outputPath: outputDir,
                  watermarkPath: watermarkImage!,
                  position: 'center',
                  scale: 100,
                  opacity: 50,
                }

                const id = await processMedia(request)
                setTaskId(id)

                // 开始轮询任务状态
                const interval = setInterval(async () => {
                  try {
                    const taskStatus = await getProcessStatus(id)
                    setProgress(taskStatus.progress)
                    setStatus(taskStatus.status)

                    if (taskStatus.error) {
                      setError(taskStatus.error)
                      clearInterval(interval)
                    }

                    if (taskStatus.status === 'completed') {
                      clearInterval(interval)
                    }
                  } catch (err) {
                    setError(err instanceof Error ? err.message : '未知错误')
                    clearInterval(interval)
                  }
                }, 1000)
              } catch (err) {
                setError(err instanceof Error ? err.message : '未知错误')
              }
            }}
          >
            开始处理
          </button>
        </div>
      </div>
    </div>
  )
}