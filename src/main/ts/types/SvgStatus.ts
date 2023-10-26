import { SVGProps } from 'react'

import { Status } from './Status'
import { SvgItem } from './SvgItem'

export interface SvgStatus extends Status {
  key: string
  innerRadius: number
  outerRadius: number
  arc: SVGProps<SVGPathElement>
  label: {
    arc: SVGProps<SVGPathElement>
    text: SVGProps<SVGTextElement>
    textPath: SVGProps<SVGTextPathElement>
  }
  items: SvgItem[]
}
