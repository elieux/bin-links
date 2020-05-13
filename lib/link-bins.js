const isWindows = require('./is-windows.js')
const binTarget = require('./bin-target.js')
const { dirname, resolve, relative } = require('path')
const linkBin = require('./link-bin.js')
const shimBin = require('./shim-bin.js');
const normalize = require('npm-normalize-package-bin')

const linkBins = ({path, pkg, top, force}) => {
  pkg = normalize(pkg)
  if (!pkg.bin)
    return Promise.resolve([])
  const promises = []
  const target = binTarget({path, top})
  for (const [key, val] of Object.entries(pkg.bin)) {
    const to = resolve(target, key)
    const absFrom = resolve(path, val)
    const from = relative(dirname(to), absFrom)
    promises.push(isWindows
        ? shimBin({path, from, to, absFrom, force})
        : linkBin({path, from, to, absFrom, force}).catch(_ => shimBin({path, from, to, absFrom, force}))
    )
  }
  return Promise.all(promises)
}

module.exports = linkBins
