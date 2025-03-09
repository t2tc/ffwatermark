interface ExecuteStepProps {
  selectedFiles: File[]
  watermarkImage: string | null
  outputDir: string
  onOutputDirChange: (dir: string) => void
  onExecute: () => void
}

export function ExecuteStep({
  selectedFiles,
  watermarkImage,
  outputDir,
  onOutputDirChange,
  onExecute,
}: ExecuteStepProps) {
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

      <div className="text-center">
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!watermarkImage || selectedFiles.length === 0 || !outputDir}
          onClick={onExecute}
        >
          开始处理
        </button>
      </div>
    </div>
  )
}