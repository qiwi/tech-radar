import { SectorsRadar, SvgSector } from '../types'
import { arc } from './arc'
import { getSvgSectorSize } from './svg-sector-size'
import { getSvgSectorStatuses } from './svg-sector-statuses'
import { getSvgSectorPies } from './svg-sectors-pies'

export const getSvgSectors: (
  radar: SectorsRadar,
  itemSize: number,
  titleSize: number,
) => SvgSector[] = (radar, itemSize, titleSize) => {
  const pies = getSvgSectorPies(radar)
  const sectorSize = getSvgSectorSize(radar)
  return radar.sectors
    .map((sector, sectorIndex) => ({
      ...sector,
      key: `sector-${sectorIndex}`,
      startAngle: pies[sectorIndex].startAngle,
      endAngle: pies[sectorIndex].endAngle,
      statuses: [],
    }))
    .map((sector, sectorIndex) => ({
      ...sector,
      label: {
        arc: {
          id: `sector-${sectorIndex}-label`,
          d:
            arc({
              innerRadius: sectorSize + titleSize,
              outerRadius: sectorSize + titleSize,
              startAngle: sector.startAngle,
              endAngle: sector.endAngle,
            }) || '',
          fill: 'none',
          stroke: 'none',
        },
        text: {
          fill: sector.color,
          textAnchor: 'middle',
          dy: sectorIndex >= 0.5 * radar.sectors.length ? '1rem' : '-0.5rem',
          opacity: 1,
        },
        textPath: {
          href: `#sector-${sectorIndex}-label`,
          startOffset:
            sectorIndex >= 0.5 * radar.sectors.length ? '75%' : '25%',
        },
      },
      background: {
        arc: {
          d:
            arc({
              innerRadius: 0,
              outerRadius: sectorSize,
              startAngle: sector.startAngle,
              endAngle: sector.endAngle,
            }) || '',
          fill: `url(#sector-${sectorIndex}-gradient)`,
          opacity: 0.25,
        },
        gradient: {
          id: `sector-${sectorIndex}-gradient`,
          r: 1,
        },
        gradientStart: {
          offset: '0%',
          stopColor: sector.color,
          stopOpacity: 1,
        },
        gradientStop: {
          offset: '100%',
          stopColor: sector.color,
          stopOpacity: 0,
        },
      },
    }))
    .map((sector, sectorIndex) => ({
      ...sector,
      statuses: getSvgSectorStatuses(radar, sector, sectorIndex, itemSize),
    }))
}
