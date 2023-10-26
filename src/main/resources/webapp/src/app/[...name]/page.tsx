import { api, types } from '@qiwi/tech-radar'

import { notFound } from 'next/navigation'
import qs from 'query-string'

import { Scopes, Sectors } from '../../ui'
import { Item } from '../../ui'

export const generateMetadata = async (props: NamePageProps) => {
  const result = await findRadar(props)
  if (result === undefined) {
    return
  }
  if (result.type === 'scope') {
    const scope = result.data
    if (scope === undefined || scope.radar === undefined) {
      return
    }
    if (scope.radar.type === 'sectors' || scope.radar.type === 'scopes') {
      return {
        title: scope.radar.title,
      }
    }
  }
  if (result.type === 'item') {
    return {
      title: result.data.title,
    }
  }
}

export const generateStaticParams = async () => {
  const radar = await api.getRadar()
  return getNames(radar).map((name) => ({ name }))
}

const getNames = (radar: types.Radar): string[][] => {
  if (radar.type === 'scopes') {
    return radar.scopes.reduce(
      (names, scope) => [
        ...names,
        [scope.name],
        ...getNames(scope.radar).map((names) => [scope.name, ...names]),
      ],
      [] as string[][],
    )
  }
  if (radar.type === 'sectors') {
    return radar.items.map((item) => [item.name])
  }
  return []
}

const findByName = (
  radar: types.Radar,
  names: string[],
):
  | undefined
  | { type: 'scope'; data: types.Scope }
  | { type: 'item'; data: types.Item } => {
  if (radar.type === 'scopes') {
    const scope = radar.scopes.find((scope) => names[0] === scope.name)
    if (!scope) {
      return
    }
    if (names.length > 1) {
      return findByName(scope.radar, names.slice(1))
    }
    return {
      type: 'scope',
      data: scope,
    }
  }
  if (radar.type === 'sectors') {
    if (names.length > 1) {
      return
    }
    const item = radar.items.find((item) => names[0] === item.name)
    if (!item) {
      return
    }
    return {
      type: 'item',
      data: item,
    }
  }
}

const findRadar = async ({ params }: NamePageProps) => {
  return findByName(
    await api.getRadar(),
    params.name.map((name) => qs.parse(`name=${name}`).name) as string[],
  )
}

interface NamePageProps {
  params: {
    name: string[]
  }
}

const NamePage = async (props: NamePageProps) => {
  const result = await findRadar(props)
  if (result === undefined) {
    return notFound()
  }
  if (result.type === 'scope') {
    const scope = result.data
    if (scope === undefined || scope.radar === undefined) {
      return notFound()
    }
    if (scope.radar.type === 'sectors') {
      return (
        <Sectors
          baseHref={`/${props.params.name.join('/')}`}
          radar={scope.radar}
        />
      )
    }
    if (scope.radar.type === 'scopes') {
      return (
        <Scopes
          baseHref={`/${props.params.name.join('/')}`}
          radar={scope.radar}
        />
      )
    }
  }
  if (result.type === 'item') {
    const item = result.data
    return <Item item={item} />
  }
  return notFound()
}

export default NamePage
