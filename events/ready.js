const logger = require('../logger')
const version = require('../package.json').version
module.exports = (client) => {
  logger.info(`${client.user.username} is ready.`)
  global.logchan = client.channels.get('435159402463625225')
  client.user.setActivity(`Nite v${version} - !help`)
}