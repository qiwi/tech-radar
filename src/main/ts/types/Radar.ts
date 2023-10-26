import { Item } from './Item'
import { Scope } from './Scope'
import { Sector } from './Sector'
import { Status } from './Status'

export interface SectorsRadar {
  type: 'sectors'
  title: string
  sectors: Sector[]
  statuses: Status[]
  items: Item[]
}

export interface ScopesRadar {
  type: 'scopes'
  title: string
  scopes: Scope[]
}

export interface PathRadar {
  type: 'path'
  path: string
}

export type Radar = ScopesRadar | SectorsRadar | PathRadar
