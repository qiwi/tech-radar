import * as zalando from './zalando/index.js'
import * as aurora from './aurora/index.js'

/**
 * Available renderer backends. Each module must export an async
 * `render(ctx)` that consumes the pipeline context and writes the full
 * static site under `ctx.output`.
 */
export const renderers = { zalando, aurora }

/**
 * Dispatch entry — picks a renderer by name and runs it.
 *
 * @param {Object} ctx Pipeline context with `radars`, `output`, `renderer`, …
 * @returns {Promise<void>}
 */
export const render = async (ctx) => {
  const name = ctx.renderer || 'zalando'
  const renderer = renderers[name]
  if (!renderer) {
    throw new Error(
      `Unknown renderer: "${name}". Available: ${Object.keys(renderers).join(', ')}`,
    )
  }
  return renderer.render(ctx)
}
