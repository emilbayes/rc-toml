const assert = require('nanoassert')
const os = require('os')
const cc = require('./utils')
const fs = require('fs')
const path = require('path')
const deepExtend = require('deep-extend')
const serialise = require('object-tojson')
const etc = '/etc'
const localEtc = '/usr/local/etc'
const win = os.platform() === 'win32'
const home = os.homedir()

module.exports = function (name, defaults = {}, argv, parse = cc.parse) {
  assert(typeof name === 'string', 'name must be string')
  if (!argv) argv = require('minimist')(process.argv.slice(2))

  var env = cc.env(name + '_')

  var configs = [defaults]
  var configFiles = []
  function addConfigFile (file) {
    if (configFiles.indexOf(file) >= 0) return
    var fileConfig = cc.file(file)
    if (fileConfig) {
      configs.push(parse(fileConfig))
      configFiles.push(file)
    }
  }

  // which files do we look at?
  if (!win) {
    [
      path.join(etc, name, 'config'),
      path.join(etc, name + 'rc'),
      path.join(etc, name + '.conf'),
      path.join(localEtc, name, 'config'),
      path.join(localEtc, name + 'rc'),
      path.join(localEtc, name + '.conf')
    ].forEach(addConfigFile)
  }

  if (home) {
    [
      path.join(home, '.config', name, 'config'),
      path.join(home, '.config', name),
      path.join(home, '.' + name, 'config'),
      path.join(home, '.' + name + 'config'),
      path.join(home, '.' + name + 'rc')
    ].forEach(addConfigFile)
  }

  addConfigFile(cc.find('.' + name + 'rc'))
  if (env.config) addConfigFile(env.config)
  if (argv.config) addConfigFile(argv.config)

  return deepExtend.apply(null, configs.concat([
    env,
    argv,
    { configs, configFiles, primaryConfig: configFiles[configFiles.length - 1] }
  ]))
}

const SYSTEM = (p) => p.startsWith(etc) || p.startsWith(localEtc)
const GLOBAL = (p) => p.startsWith(home)
const LOCAL = (p) => p.startsWith('.')

module.exports.select = function select (config, file = GLOBAL) {
  if (file == null) {
    file = config.primaryConfig
  }

  if (typeof file === 'string') {
    const _file = path.resolve(file)
    file = (p) => p === _file
  }

  const idx = config.configFiles.findIndex(file)
  if (idx < 0) return { config, configFile: null }

  return {
    config: config.configs[idx + 1],
    configFile: config.configFiles[idx]
  }
}

module.exports.path = (name) => path.join(home, '.' + name + 'rc')

module.exports.select.SYSTEM = SYSTEM
module.exports.select.GLOBAL = GLOBAL
module.exports.select.LOCAL = LOCAL

module.exports.write = function (config, configPath, stringify = cc.stringify) {
  assert(typeof configPath === 'string', 'configPath must be string')
  const obj = serialise(config, (k, v) => {
    if (k === '_') return undefined
    if (k === 'configs') return undefined
    if (k === 'primaryConfig') return undefined
    if (k === 'configFiles') return undefined

    return v
  })

  fs.writeFileSync(configPath, stringify(obj))
}
