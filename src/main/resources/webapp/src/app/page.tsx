import { api } from '@qiwi/tech-radar'

import { notFound } from 'next/navigation'

import { Scopes, Sectors } from '../ui'

export const generateMetadata = async () => {
  const radar = await api.getRadar()
  return {
    title:
      radar.type === 'scopes' || radar.type === 'sectors' ? radar.title : '',
  }
}

const Home = async () => {
  const radar = await api.getRadar()
  if (radar.type === 'sectors') {
    return <Sectors radar={radar} />
  }
  if (radar.type === 'scopes') {
    return <Scopes radar={radar} />
  }
  return notFound()
}

export default Home
