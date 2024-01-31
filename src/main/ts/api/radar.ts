import { Radar } from '../types'

const prepareRadar: (radar: Radar) => Promise<Radar> = async (radar) => {
  if (radar.type === 'path') {
    return await getRadar(radar.path)
  }
  if (radar.type === 'scopes') {
    return {
      ...radar,
      scopes: await Promise.all(
        radar.scopes.map(async (scope) => ({
          ...scope,
          radar: await prepareRadar(scope.radar),
        })),
      ),
    }
  }
  return radar
}

export const getRadar: (path?: string) => Promise<Radar> = async (
  path = process.env.RADAR_JSON || 'radar.json',
) => {
  const host =
    process.env.RADAR_URL ??
    `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
  const res = await fetch(`${host}/${path}`)
  const json = (await res.json()) as Radar
  return await prepareRadar(json)
}
