// Aurora client-side: shipped as a static asset, loaded with `defer`.
// Hover-card with description, blip↔legend cross-highlight.

export const js = `(() => {
  const card = document.getElementById('hoverCard')
  if (!card) return
  const elNum  = card.querySelector('.hc-num')
  const elName = card.querySelector('.hc-name')
  const elRing = card.querySelector('.hc-ring')
  const elMove = card.querySelector('.hc-move')
  const elDesc = card.querySelector('.hc-desc')
  const blips  = document.querySelectorAll('.blip')
  const legendItems = document.querySelectorAll('.legend-ring li')
  const numToBlip = new Map()
  const numToLegend = new Map()
  blips.forEach(b => numToBlip.set(b.dataset.num, b))
  legendItems.forEach(li => {
    const num = li.querySelector('.li-num')?.textContent
    if (num) numToLegend.set(num, li)
  })

  const positionCard = (ev) => {
    if (!ev) return
    const margin = 16
    const w = card.offsetWidth || 320
    const h = card.offsetHeight || 100
    let x = ev.clientX + margin
    let y = ev.clientY + margin
    if (x + w + margin > innerWidth)  x = ev.clientX - w - margin
    if (y + h + margin > innerHeight) y = ev.clientY - h - margin
    card.style.left = Math.max(margin, x) + 'px'
    card.style.top  = Math.max(margin, y) + 'px'
  }

  const populate = (blip) => {
    elNum.textContent  = '#' + blip.dataset.num
    elName.textContent = blip.dataset.name
    elRing.textContent = blip.dataset.ring
    const moved = +blip.dataset.moved || 0
    elMove.textContent = moved > 0 ? 'moved up' : moved < 0 ? 'moved down' : ''
    elDesc.textContent = blip.dataset.desc || ''
  }

  const showCard = (blip, ev) => {
    populate(blip)
    positionCard(ev)
    card.classList.add('is-shown')
  }
  const hideCard = () => card.classList.remove('is-shown')

  const setActive = (num, on) => {
    numToBlip.get(num)?.classList.toggle('is-active', on)
    numToLegend.get(num)?.classList.toggle('is-active', on)
  }

  blips.forEach(b => {
    const link = b.parentElement
    link.addEventListener('pointerenter', e => { showCard(b, e); setActive(b.dataset.num, true) })
    link.addEventListener('pointermove',  positionCard)
    link.addEventListener('pointerleave', () => { hideCard(); setActive(b.dataset.num, false) })
    link.addEventListener('focus', () => {
      const r = link.getBoundingClientRect()
      showCard(b, { clientX: r.left + r.width/2, clientY: r.top })
      setActive(b.dataset.num, true)
    })
    link.addEventListener('blur', () => { hideCard(); setActive(b.dataset.num, false) })
  })

  legendItems.forEach(li => {
    const num = li.querySelector('.li-num')?.textContent
    if (!num) return
    li.addEventListener('pointerenter', () => setActive(num, true))
    li.addEventListener('pointerleave', () => setActive(num, false))
    li.addEventListener('click', () => {
      const blip = numToBlip.get(num)
      const link = blip?.parentElement
      const href = link?.getAttribute('href')
      if (href) location.href = href
    })
  })
})()
`
