import { SVGProps } from 'react'

import { Sector } from './Sector'
import { SvgStatus } from './SvgStatus'

export interface SvgSector extends Sector {
  key: string
  startAngle: number
  endAngle: number
  label: {
    arc: SVGProps<SVGPathElement>
    text: SVGProps<SVGTextElement>
    textPath: SVGProps<SVGTextPathElement>
  }
  background: {
    arc: SVGProps<SVGPathElement>
    gradient: SVGProps<SVGRadialGradientElement>
    gradientStart: SVGProps<SVGStopElement>
    gradientStop: SVGProps<SVGStopElement>
  }
  statuses: SvgStatus[]
}
