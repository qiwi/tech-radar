import { SectorsRadar } from '../types'
import { getSvgSectorSize } from './svg-sector-size'

export const getSvgRadarSize: (
  radar: SectorsRadar,
  titleSize: number,
) => number = (radar, titleSize) => 2 * getSvgSectorSize(radar) + 4 * titleSize
