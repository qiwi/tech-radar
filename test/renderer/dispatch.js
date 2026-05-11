// Smoke coverage for the renderer dispatch — both the success path
// (default fallback when `ctx.renderer` is omitted) and the error path
// (unknown renderer name).

import { render, renderers } from '../../src/renderer/index.js'

describe('renderer dispatch', () => {
  it('exposes both backends in the registry', () => {
    expect(Object.keys(renderers).sort()).toEqual(['aurora', 'zalando'])
  })

  it('falls back to zalando when ctx.renderer is omitted', async () => {
    const calls = []
    const stub = { render: async (ctx) => calls.push(ctx) }
    const original = renderers.zalando
    renderers.zalando = stub
    try {
      await render({ /* no renderer */ })
    } finally {
      renderers.zalando = original
    }
    expect(calls).toHaveLength(1)
  })

  it('throws for an unknown renderer name', async () => {
    await expect(render({ renderer: 'nope' })).rejects.toThrow(
      /Unknown renderer: "nope"/,
    )
  })
})
