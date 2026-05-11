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
  renderer?: 'zalando' | 'aurora'
  /** Path to a custom favicon (.ico or .png). Copied to `<output>/favicon.ico`.
   *  When omitted, the bundled default is used. */
  favicon?: string
  /** Aurora only: path to an .md or .html file with radar overview content.
   *  When set, a global About page is written to `<output>/about/` and the
   *  aurora legend gets a `?` link surfacing it. */
  about?: string
  /** Aurora only: include the generator credit ("QIWI ❤ Open Source", with
   *  the trailing words linking back to the generator repo) in the legend
   *  footer. @default true */
  credits?: boolean
}

export declare function run(options?: Options): Promise<void>
