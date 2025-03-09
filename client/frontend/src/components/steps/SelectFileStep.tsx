import { FileSelector } from '../FileSelector'

interface FileStepProps {
  onFilesSelected: (files: File[]) => void
  selectedFiles: File[]
}

export function SelectFileStep({ onFilesSelected, selectedFiles }: FileStepProps) {
  return (
    <div>
      <FileSelector
        onFilesSelected={onFilesSelected}
        accept="video/*,image/*"
        multiple
      />
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">已选择的文件：</h3>
          <ul className="space-y-2">
            {selectedFiles.map(file => (
              <li
                key={file.name}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <div className="i-carbon-document text-xl" />
                <span>{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}