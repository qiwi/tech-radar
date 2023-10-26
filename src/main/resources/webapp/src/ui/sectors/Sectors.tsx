import { types } from '@qiwi/tech-radar'

import Link from 'next/link'

import { Radar } from './Radar'
import styles from './sectors.module.css'
import { Table } from './Table'

export interface SectorsProps {
  radar: types.SectorsRadar
  baseHref?: string
}

export const Sectors = ({ radar, baseHref = '' }: SectorsProps) => {
  return (
    <main className={styles.main}>
      <h1>
        {baseHref ? (
          <>
            <Link href={`..`}>&lt;-</Link> {radar.title}
          </>
        ) : (
          radar.title
        )}
      </h1>
      <Radar radar={radar} baseHref={baseHref} />
      <Table radar={radar} baseHref={baseHref} />
    </main>
  )
}
