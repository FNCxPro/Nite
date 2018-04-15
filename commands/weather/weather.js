const { Command, CommandAPI } = require('../../handler')
const { Message } = require('discord.js')
const db = require('../../db')
const config = require('config')
const snekfetch = require('snekfetch')

module.exports = class WeatherCommand extends Command {
  constructor() {
    super('weather', {
      name: 'Weather',
      description: 'Weather',
      module: 'weather',
      args: [{
        name: 'city',
        type: 'string',
        required: true,
        description: 'City of where you want to get weather from',
        multiword: true
      }],
      ownerOnly: false
    })
  }
  /**
   * Run the command
   * @param {Object[]} args - Arguments
   * @param {Message} msg - Message that triggered the command
   * @param {CommandAPI} api - Command API
   */
  async run(args, msg, api) {
    const key = config.get('twckey')
    const res = await snekfetch.get(`https://api.weather.com/v3/location/search?query=${encodeURIComponent(args.city.value)}&language=en-US&format=json&apiKey=${key}`)
    const lat = res.body.location.latitude[0]
    const lng = res.body.location.longitude[0]
    const city = res.body.location.city[0]
    const state = res.body.location.adminDistrictCode[0] || res.body.location.adminDistrict[0]

    const _nowcast = await snekfetch.get(`https://api.weather.com/v1/geocode/${lat}/${lng}/forecast/nowcast.json?language=en-US&apiKey=${key}`)
    const _cc = await snekfetch.get(`https://api.weather.com/v1/geocode/${lat}/${lng}/observations/current.json?language=en-US&apiKey=${key}`)
    const nowcast = _nowcast.body
    const cc = _cc.body
    const embed = api.success(nowcast.forecast.narrative_256char, msg.author)
    let units = cc.metadata.units === 'e' ? 'F' : 'C'
    let unitCode = cc.metadata.units === 'e' ? 'imperial' : 'metric'
    embed.setTitle(`🌥 \`Weather for ${city}, ${state}\``)
    embed.setImage(`https://relative.pro/icons/${nowcast.forecast.icon_code.length === 1 ? '0'+nowcast.forecast.icon_code : nowcast.forecast.icon_code}.png`)
    embed.addField('Temperature', `${cc.observation[unitCode].temp.toString()} °${units}`)
    embed.addField('Feels Like', `${cc.observation[unitCode].feels_like.toString()} °${units}`)
    embed.addField('Wind', `${cc.observation[unitCode].wspd} ${units === 'F' ? 'MPH' : 'k/h'} ${cc.observation.wdir_cardinal}`)
    return embed
  }
}