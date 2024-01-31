import { SectorsRadar, SvgSector } from '../types'
import { getSvgRadarSize } from './svg-radar-size'
import { getSvgSectors } from './svg-sectors'

export const getSvgRadar: (
  radar: SectorsRadar,
  titleSize?: number,
  itemSize?: number,
) => {
  size: number
  sectors: SvgSector[]
} = (radar, titleSize = 25, itemSize = 12) => {
  const radarSize = getSvgRadarSize(radar, titleSize)
  const sectorsExt = getSvgSectors(radar, itemSize, titleSize)
  return {
    size: radarSize,
    sectors: sectorsExt,
  }
}
