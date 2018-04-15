const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const db = require('../../db')

module.exports = class ColorCommand extends Command {
  constructor() {
    super('color', {
      name: 'Color',
      description: 'Color command',
      module: 'misc',
      ownerOnly: false,
      guildOnly: true,
      args: [{
        name: 'color',
        type: 'string',
        required: true,
        description: 'Color that you want in hex ex. #FF00FF'
      }]
    })
  }
  /**
   * Run the command
   * @param {Object[]} args - Arguments
   * @param {Message} msg - Message that triggered the command
   * @param {CommandAPI} api - Command API
   */
  async run(args, msg, api) {
    let color = args.color.value
    if (!/^#[0-9A-F]{6}$/i.test(color)) return api.error('That color is an invalid hex color. Example: #FF00FF')
    color = color.toLowerCase()
    let dbRs = await db.r.table('roles').get(color).run()
    let roleId
    if (typeof dbRs === 'object') {
      roleId = dbRs.roleId
    } else {
      const role = await msg.guild.createRole({
        name: color,
        position: 4,
        permissions: 0,
        mentionable: false,
        hoist: false,
        color
      })
      roleId = role.id
      await db.r.table('roles').insert({
        id: color,
        roleId
      }).run()
    }
    msg.member.roles.forEach((role) => {
      if (role.name.startsWith('#') && role.name !== '#promotion') {
        msg.member.removeRole(role.id)
      }
    })
    msg.member.addRole(roleId)
    return api.success(`Your color has been set to ${color}!`).setColor(color)
  }
}