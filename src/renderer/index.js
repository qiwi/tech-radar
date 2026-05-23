import * as zalando from './zalando/index.js'
import * as aurora from './aurora/index.js'

/**
 * Available renderer backends. Each module must export an async
 * `render(ctx)` that consumes the pipeline context and writes the full
 * static site under `ctx.output`.
 */
export const renderers = { zalando, aurora }

/** Capability: which radar schemas a backend can render. */
const ACCEPTS = {
  zalando: ['4x4'],
  aurora: ['4x4', 'flex'],
}

/**
 * Dispatch entry — picks a renderer by name and runs it.
 *
 * Each backend declares which radar schemas it accepts (`ACCEPTS`).
 * If any of the input radars doesn't match the chosen backend, we throw
 * with a pointer at the renderer that does — typically aurora.
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
  const accept = ACCEPTS[name] || []
  const radars = ctx.radars || []
  const compatible = radars.filter(
    (r) => !r.document || accept.includes(r.document._schema),
  )
  const skipped = radars.filter(
    (r) => r.document && !accept.includes(r.document._schema),
  )
  if (skipped.length && !compatible.length) {
    // Every input is incompatible — almost certainly a user mistake.
    const sample = skipped[0]
    throw new Error(
      `Renderer "${name}" only accepts ${accept.join('/')} radars. ` +
        `Got "${sample.document._schema}" from ${sample.source}. ` +
        `Use --renderer aurora for non-4x4 layouts.`,
    )
  }
  if (skipped.length) {
    // Mixed batch (e.g. dual-renderer demo): drop the incompatible radars
    // with a single grouped warning. The other backend will pick them up.
    console.warn(
      `[renderer:${name}] skipping ${skipped.length} radar(s) with incompatible schema:\n` +
        skipped
          .map((r) => `  - ${r.source} (${r.document._schema})`)
          .join('\n'),
    )
  }
  return renderer.render({ ...ctx, radars: compatible })
}
