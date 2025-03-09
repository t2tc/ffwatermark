export type TabType = 'files' | 'watermark' | 'execute'

export interface Step {
  id: TabType
  title: string
}

export const steps: Step[] = [
  { id: 'files', title: '选择文件' },
  { id: 'watermark', title: '创建水印' },
  { id: 'execute', title: '执行' },
]