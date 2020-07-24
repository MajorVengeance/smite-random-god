const Discord = require('discord.js');

module.exports = {
	name: 'gods',
	description: 'List all gods in the bot!',
	args: false,
	usage: '[command filters]',
	list: require('../gods.json'),
	execute(msg, args) {
		const reply = new Discord.MessageEmbed()
			.setTitle('Here\'s your god!')
			.setColor('blue');
		msg.reply(reply);
	},
};