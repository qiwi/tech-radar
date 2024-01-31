import { SectorsRadar } from '../types'

export const getSvgSectorSize: (radar: SectorsRadar) => number = (radar) =>
  radar.statuses.reduce((size, status) => size + status.size, 0)
