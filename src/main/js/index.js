// import fs from 'fs'
import path from 'path'
// import parse from 'csv-parse/lib/sync'
import fsExtra from 'fs-extra'

const tplPath = 'src/main/tpl'

export const generateTechRadar = ({csvPath, outDir}) => {
  // const csvPathResolved = path.resolve(csvPath)
  const outDirResolved = path.resolve(outDir)
  fsExtra.copySync(tplPath, outDirResolved)

}
