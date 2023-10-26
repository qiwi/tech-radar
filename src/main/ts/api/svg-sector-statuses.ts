import { SectorsRadar, SvgSector, SvgStatus } from '../types'
import { arc } from './arc'
import { getSvgStatusesRadius } from './statuses-radius'
import { getSvgSectorStatusItems } from './svg-sector-status-items'

export const getSvgSectorStatuses: (
  radar: SectorsRadar,
  sector: SvgSector,
  sectorIndex: number,
  itemSize: number,
) => SvgStatus[] = (radar, sector, sectorIndex, itemSize) => {
  const radius = getSvgStatusesRadius(radar)
  return radar.statuses
    .map((status, statusIndex) => ({
      ...status,
      key: `sector-${sectorIndex}-status-${statusIndex}`,
      outerRadius: radius[statusIndex],
      innerRadius: radius[statusIndex] - status.thick,
      items: [],
    }))
    .map((status, statusIndex) => ({
      ...status,
      arc: {
        d:
          arc({
            innerRadius: status.innerRadius,
            outerRadius: status.outerRadius,
            startAngle: sector.startAngle,
            endAngle: sector.endAngle,
          }) || '',
        fill: sector.color,
      },
      label: {
        arc: {
          id: `sector-${sectorIndex}-status-${statusIndex}-label`,
          d:
            arc({
              innerRadius: status.innerRadius - status.size / 2,
              outerRadius: status.innerRadius - status.size / 2,
              startAngle: sector.startAngle,
              endAngle: sector.endAngle,
            }) || '',
          fill: 'none',
          stroke: 'none',
        },
        text: {
          fill: sector.color,
          textAnchor: 'middle',
          dy: '0.5rem',
          opacity: 0.5,
        },
        textPath: {
          href: `#sector-${sectorIndex}-status-${statusIndex}-label`,
          startOffset:
            sectorIndex >= 0.5 * radar.sectors.length ? '75%' : '25%',
        },
      },
    }))
    .map((status, statusIndex) => ({
      ...status,
      items: getSvgSectorStatusItems(
        radar,
        status,
        statusIndex,
        sector,
        sectorIndex,
        itemSize,
      ),
    }))
}
