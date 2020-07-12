const rc = require('.')
// Read config
const config = rc('app')

// Find global config file
var { configFile } = rc.select(config)
// Otherwise default to $HOME/.apprc
if (configFile == null) configFile = rc.path('app')

// Write resolve config
rc.write(config, configFile)
