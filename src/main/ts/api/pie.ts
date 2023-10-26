import * as d3 from 'd3'

export const pie = d3
  .pie()
  .startAngle(-0.5 * Math.PI)
  .endAngle(-0.5 * Math.PI + 2 * Math.PI)
