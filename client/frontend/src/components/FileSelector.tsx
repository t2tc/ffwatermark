import { ChangeEvent, useCallback } from 'react'

interface FileSelectorProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export function FileSelector({ onFilesSelected, accept = '*', multiple = true }: FileSelectorProps) {
  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    onFilesSelected(files)
  }, [onFilesSelected])

  return (
    <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
      <input
        type="file"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input" className="cursor-pointer">
        <div className="flex flex-col items-center gap-2">
          <div className="i-carbon-upload text-4xl text-gray-400" />
          <span className="text-gray-600">
            点击或拖拽文件到此处
          </span>
          <span className="text-sm text-gray-400">
            {multiple ? '支持选择多个文件' : '请选择单个文件'}
          </span>
        </div>
      </label>
    </div>
  )
}