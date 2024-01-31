import { useMemo } from 'react'

import { api, types } from '@qiwi/tech-radar'

import Link from 'next/link'

import styles from './radar.module.css'

export interface RadarProps {
  radar: types.SectorsRadar
  baseHref?: string
}

export const Radar = ({ radar, baseHref = '' }: RadarProps) => {
  const { size, sectors } = useMemo(() => api.getSvgRadar(radar), [radar])
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={styles.radar}>
      <g transform={`translate(${0.5 * size} ${0.5 * size})`}>
        {sectors.map((sector) => (
          <g key={sector.key}>
            <defs>
              <radialGradient {...sector.background.gradient}>
                <stop {...sector.background.gradientStart} />
                <stop {...sector.background.gradientStop} />
              </radialGradient>
            </defs>
            <path {...sector.background.arc} />
            <path {...sector.label.arc} />
            <text {...sector.label.text}>
              <textPath {...sector.label.textPath}>{sector.title}</textPath>
            </text>
            {sector.statuses.map((status) => (
              <g key={status.key}>
                <path {...status.arc} />
                <path {...status.label.arc} />
                <text {...status.label.text}>
                  <textPath {...status.label.textPath}>
                    {status.title.toUpperCase()}
                  </textPath>
                </text>
                {status.items.map((item) => (
                  <Link
                    key={item.key}
                    href={`${baseHref}/${item.name}/`}
                    title={item.title}
                  >
                    <circle {...item.circle}>
                      <title>{item.title}</title>
                    </circle>
                  </Link>
                ))}
              </g>
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}
