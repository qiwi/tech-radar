import { types } from '@qiwi/tech-radar'

import Link from 'next/link'

import styles from './item.module.css'

export interface ItemProps {
  item: types.Item
}

export const Item = ({ item }: ItemProps) => {
  return (
    <main className={styles.main}>
      <h1>
        <Link href={`..`}>&lt;-</Link> {item.title}
      </h1>
      <p>{item.description}</p>
    </main>
  )
}
