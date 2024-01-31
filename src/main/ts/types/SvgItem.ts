import { SVGProps } from 'react'

import { Item } from './Item'

export interface SvgItem extends Item {
  key: string
  circle: SVGProps<SVGCircleElement>
}
