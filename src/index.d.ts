interface RenderSettings {
  svg_id?: string
  width?: number
  height?: number
  colors?: {
    background?: string
    grid?: string
    inactive?: string
  }
  rings?: Array<{ name: string; color: string; id: string }>
  print_layout?: boolean
  [key: string]: unknown
}

interface Options {
  input?: string
  output?: string
  cwd?: string
  basePrefix?: string
  autoscope?: boolean
  navPage?: boolean
  navTitle?: string
  navFooter?: string
  temp?: string
  templates?: string
  renderSettings?: RenderSettings
}

export declare function run(options?: Options): Promise<void>
