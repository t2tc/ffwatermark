import { MediaPreview } from './MediaPreview'

interface FileListProps {
  files: File[]
  onRemove?: (index: number) => void
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">已选择的文件</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="relative group">
            <MediaPreview file={file} className="bg-gray-50 p-2 rounded-lg" />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate flex-1" title={file.name}>
                {file.name}
              </span>
              {onRemove && (
                <button
                  onClick={() => onRemove(index)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <div className="i-carbon-trash-can text-lg" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}