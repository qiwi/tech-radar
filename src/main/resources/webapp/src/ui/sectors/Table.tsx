import { types } from '@qiwi/tech-radar'

import Link from 'next/link'

import styles from './table.module.css'

export interface TableProps {
  radar: types.SectorsRadar
  baseHref?: string
}

export const Table = ({ radar, baseHref = '' }: TableProps) => {
  const { sectors, statuses, items } = radar
  return (
    <div className={styles.sectors}>
      {sectors.map((sector, index) => {
        const sectorItems = items.filter((item) => item.sector === sector.name)
        if (sectorItems.length === 0) {
          return null
        }
        return (
          <div key={index} className={styles.sector}>
            <h2>{sector.title}</h2>
            <div>
              {statuses.map((status, jndex) => {
                const statusItems = sectorItems.filter(
                  (item) => item.status === status.name,
                )
                if (statusItems.length === 0) {
                  return null
                }
                return (
                  <div key={jndex} className={styles.status}>
                    <h3>{status.title}</h3>
                    <div>
                      {statusItems.map((item, kndex) => (
                        <p key={kndex}>
                          <Link href={`${baseHref}/${item.name}/`}>
                            {item.title}
                          </Link>
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
