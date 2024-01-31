import { types } from '@qiwi/tech-radar'

import Link from 'next/link'

import styles from './scopes.module.css'

export interface ScopesProps {
  radar: types.ScopesRadar
  baseHref?: string
}

export const Scopes = ({ radar, baseHref = '' }: ScopesProps) => (
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
    <div className={styles.grid}>
      {radar.scopes.map((scope) => (
        <Link
          key={scope.name}
          className={styles.card}
          href={`${baseHref}/${scope.name}/`}
        >
          <h2>
            {scope.title} <span>-&gt;</span>
          </h2>
          <p>{scope.description}</p>
        </Link>
      ))}
    </div>
  </main>
)
