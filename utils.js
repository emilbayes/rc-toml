const fs = require('fs')
const TOML = require('@iarna/toml')
const path = require('path')

exports.parse = function (content) {
  return TOML.parse(content)
}

exports.stringify = function (content) {
  return TOML.stringify(content)
}

exports.file = function (...args) {
  args = args.filter(function (arg) { return arg != null })

  // path.join breaks if it's a not a string, so just skip this.
  for (const v of args) {
    if (typeof v !== 'string') return
  }

  var file = path.join(...args)
  try {
    return fs.readFileSync(file, 'utf-8')
  } catch (err) {}
}

exports.env = function (prefix, env) {
  env = env || process.env
  var obj = {}
  var l = prefix.length
  for (var k of Object.keys(env)) {
    if (k.toLowerCase().indexOf(prefix.toLowerCase()) === 0) {
      var keypath = k.substring(l).split('__')

      // Trim empty strings from keypath array
      var _emptyStringIndex
      while ((_emptyStringIndex = keypath.indexOf('')) > -1) {
        keypath.splice(_emptyStringIndex, 1)
      }

      var cursor = obj
      keypath.forEach(function _buildSubObj (_subkey, i) {
        // (check for _subkey first so we ignore empty strings)
        // (check for cursor to avoid assignment to primitive objects)
        if (!_subkey || typeof cursor !== 'object') return

        // If this is the last key, just stuff the value in there
        // Assigns actual value from env variable to final key
        // (unless it's just an empty string- in that case use the last valid key)
        if (i === keypath.length - 1) cursor[_subkey] = env[k]

        // Build sub-object if nothing already exists at the keypath
        if (cursor[_subkey] === undefined) cursor[_subkey] = {}

        // Increment cursor used to track the object at the current depth
        cursor = cursor[_subkey]
      })
    }
  }

  return obj
}

exports.find = function (...args) {
  var rel = path.join(...args)

  function find (start, rel) {
    var file = path.join(start, rel)
    try {
      fs.statSync(file)
      return file
    } catch (err) {
      if (path.dirname(start) !== start) { // root
        return find(path.dirname(start), rel)
      }
    }
  }

  return find(process.cwd(), rel)
}
