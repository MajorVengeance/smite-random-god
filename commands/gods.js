const Discord = require('discord.js');

module.exports = {
	name: 'gods',
	description: 'List all gods in the bot!',
	list: require('../gods.json'),
	execute(msg, args) {
		let godsToList = new Array();
		if(args.includes('mage')) {
			godsToList = godsToList.concat(this.list.filter(a => a.class.toLowerCase() == 'mage'));
		}
		if(args.includes('guardian')) {
			godsToList = godsToList.concat(this.list.filter(a => a.class == 'mage'));
		}
		if(args.includes('assassin')) {
			godsToList = godsToList.concat(this.list.filter(a => a.class == 'mage'));
		}
		if(args.includes('hunter')) {
			godsToList = godsToList.concat(this.list.filter(a => a.class == 'mage'));
		}
		if(args.includes('warrior')) {
			godsToList = godsToList.concat(this.list.filter(a => a.class == 'mage'));
		}

		if(godsToList.length < 1) {
			godsToList = this.list;
		}

		console.log(godsToList[0]);
		const reply = new Discord.MessageEmbed()
			.setTitle('Here\'s your gods!')
			.setColor('blue')
			.setDescription(` ${godsToList.map(a => a.name).join(', ')}`);
		msg.reply(reply);
	},
};