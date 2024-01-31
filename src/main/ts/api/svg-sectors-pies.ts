import { SectorsRadar } from '../types'
import { pie } from './pie'

export const getSvgSectorPies = (radar: SectorsRadar) =>
  pie.sort(null)(radar.sectors.map(() => 1))
