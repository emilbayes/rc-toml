# `toml-rc`

> TOML based clone of dominictarr's `rc` module

## Usage

```js
const rc = require('toml-rc')
// Read config
const config = rc('app')

// Find global config file
var { configFile } = rc.select(config)
// Otherwise default to $HOME/.apprc
if (configFile == null) configFile = rc.path('app')

// Write resolve config
rc.write(config, configFile)
```

## API

### `const config = rc(name, [defaults = {}], [argv], [parse])`

Returns a configuration object for app `name`, with `defaults`.
`argv` is optional, and parsed by `minimist` by default. `parse` is applied to
each configuration file, and defaults to `@iarna/toml`. Three special properties
are applied to the final configuration:

* `configs` is an array of defaults and of the parsed objects from files: `[defaults, file1, ...]`
* `configFiles` is an array of the paths to the loaded configs
* `primaryConfig` is the path to the highest precedence file

Configuration is loaded and merged in the following order (most to least
 important):

Process:
* `argv` parsed by minimist (e.g. `--foo baz`, also nested: `--foo.bar=baz`)
* `env` with `${APP_NAME}_` prefix
  * use `__` to indicate nested properties (e.g. `appname_foo__bar__baz` => `foo.bar.baz`)
* `--config FILE`
* `CONFIG=FILE exec`

Local:
* Recursive walking up the tree for `.${APP_NAME}rc`

Global:
* Look in home directory for
  * `.${APP_NAME}rc`
  * `.${APP_NAME}config`
  * `.${APP_NAME}/config`
  * `.config/${APP_NAME}`
  * `.config/${APP_NAME}/config`

System:
* Look systemwide
  * `/local/usr/etc/${APP_NAME}.conf`
  * `/local/usr/etc/${APP_NAME}rc`
  * `/local/usr/etc/${APP_NAME}/config`
  * `/etc/${APP_NAME}.conf`
  * `/etc/${APP_NAME}rc`
  * `/etc/${APP_NAME}/config`

### `const configFile = rc.select(config, [file = rc.select.GLOBAL])`

Select the config from a specific file. Pass the parsed config as `config` and
a predicate for selecting the file. Returns `{ config, configFile }`, however
`configFile` is null if no path matches the `file` predicate.

You can pass a string as `file` and it will match exact.
You can pass `null` as `file` to select the highest precedence file.

### `rc.select.SYSTEM`

Predicate for selecting the highest precedence file from the system group above.

### `rc.select.GLOBAL`

Predicate for selecting the highest precedence file from the global group above.

### `rc.select.LOCAL`

Predicate for selecting the highest precedence file from the local group above.

### `const path = rc.path(name)`

Return the path to `$HOME/.${APP_NAME}rc`

### `rc.write(config, configPath, [stringify])`

Write `config` to `configPath` with optiona `stringify`. `stringify` defaults to
`@iarna/toml`. Ignores keys `_`, `configs`, `primaryConfig`, `configFiles` from
`config`.

## Install

```sh
npm install toml-rc
```

## License

[ISC](LICENSE)
