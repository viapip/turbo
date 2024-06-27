import { loadConfig } from 'c12'

const { config, cwd, configFile } = await loadConfig({
  // cwd: '../',
  name: 'regioni',
  // configFile: '.regionirc',
})

console.log('config', config, cwd, configFile)

export default config
