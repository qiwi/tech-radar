import { SectorsRadar } from '../types'

export const getSvgStatusesRadius: (radar: SectorsRadar) => number[] = (
  radar,
) =>
  radar.statuses.reduce(
    (radius, status, index) => [
      ...radius,
      status.size + (index === 0 ? 0 : radius[index - 1]),
    ],
    [] as number[],
  )
