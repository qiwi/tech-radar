import * as d3 from 'd3'

import { SectorsRadar, SvgItem, SvgSector, SvgStatus } from '../types'

export const getSvgSectorStatusItems: (
  radar: SectorsRadar,
  status: SvgStatus,
  statusIndex: number,
  sector: SvgSector,
  sectorIndex: number,
  itemSize: number,
) => SvgItem[] = (
  radar,
  status,
  statusIndex,
  sector,
  sectorIndex,
  itemSize,
) => {
  const size = status.size - status.thick
  const radius = status.innerRadius
  const count = Math.floor((size - 0.5 * itemSize) / (1.5 * itemSize))
  const delta = (size - itemSize * count) / (count + 1)
  const circles = []
  for (let i = 1; i <= count; i++) {
    const dotradius = radius - (i * delta + i * itemSize - 0.5 * itemSize)
    const dotlength = Math.abs(sector.startAngle - sector.endAngle) * dotradius
    const dotcount = Math.floor((dotlength - 0.5 * itemSize) / (1.5 * itemSize))
    const dotdelta = dotlength / dotcount / dotradius
    for (let j = 0; j < dotcount; j++) {
      const angle =
        sector.startAngle + j * dotdelta + 0.5 * dotdelta - 0.5 * Math.PI
      circles.push({
        r: 0.5 * itemSize,
        cx: Math.cos(angle) * dotradius,
        cy: Math.sin(angle) * dotradius,
        fill: sector.color,
      })
    }
  }
  const items = radar.items.filter(
    (item) => item.sector === sector.name && item.status == status.name,
  )
  return d3
    .shuffler(
      d3.randomLcg(sector.endAngle * items.length * circles.length * itemSize),
    )(circles)
    .slice(0, items.length)
    .map((p, itemIndex) => ({
      key: `sector-${sectorIndex}-status-${statusIndex}-item-${itemIndex}`,
      ...items[itemIndex],
      circle: p,
    }))
}
