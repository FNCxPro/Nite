const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const db = require('../../db')
const pm2 = require('pm2')
const simpleGit = require('simple-git')(__dirname)
module.exports = class UpdateCommand extends Command {
  constructor() {
    super('update', {
      name: 'Update',
      description: 'Update the bot',
      module: 'admin',
      ownerOnly: true
    })
  }
  /**
   * Run the command
   * @param {Object[]} args - Arguments
   * @param {Message} msg - Message that triggered the command
   * @param {CommandAPI} api - Command API
   */
  async run(args, msg, api) {
    simpleGit.pull(() => {
      api.handler.client.destroy().then(() => {
        pm2.restart('Nite')
      }).catch((err) => {
        pm2.restart('Nite')
      })
    })
  }
}