import { useCallback } from 'react'
import { OpenMultipleFilesDialog } from '../../wailsjs/go/main/App'

interface FileSelectorProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export function FileSelector({ onFilesSelected, multiple = true }: FileSelectorProps) {
  const handleClick = useCallback(async () => {
    try {
      const files = await OpenMultipleFilesDialog()
      if (files && files.length > 0) {
        // 将后端返回的文件信息转换为 File 对象
        const fileObjects = files.map(fileInfo => {
          return new File(
            [new Blob([])], // 空内容，因为我们只需要文件信息
            fileInfo.name,
            {
              type: fileInfo.type,
              lastModified: Date.now(),
            }
          )
        })
        onFilesSelected(fileObjects)
      }
    } catch (error) {
      console.error('选择文件失败:', error)
    }
  }, [onFilesSelected])

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="i-carbon-upload text-4xl text-gray-400" />
        <span className="text-gray-600">
          点击选择文件
        </span>
        <span className="text-sm text-gray-400">
          {multiple ? '支持选择多个文件' : '请选择单个文件'}
        </span>
      </div>
    </div>
  )
}