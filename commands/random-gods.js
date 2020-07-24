const Discord = require('discord.js');

module.exports = {
	name: 'random-gods',
	description: 'List all gods in the bot!',
	aliases: ['randomgods', 'rgods', 'randomgod', 'rgod', 'rg', 'random-god'],
	args: false,
	usage: '[command filters]',
	list: require('../gods.json'),
	execute(msg, args) {
		const argumentString = args.join(' ').toLowerCase();
		const argumentArr = argumentString.slice().split('-');
		if (argumentArr[0] == '') argumentArr.shift();
		const argumentMatrix = argumentArr.map(createMatrixArrays);
		const argumentObj = {};
		for(const x of argumentMatrix) {
			if(x == '') break;
			const paramName = x.shift().toLowerCase();
			argumentObj[paramName] = x;
		}

		let randomPool = new Array();
		randomPool = this.list;
		if(argumentObj.pantheon) {
			randomPool = randomPool.filter(god=> argumentObj.pantheon.includes(god.pantheon.toLowerCase()));
		}
		if(argumentObj.class) {
			randomPool = randomPool.filter(god => argumentObj.class.includes(god.class.toLowerCase()));
		}
		if(argumentObj.damage) {
			randomPool = randomPool.filter(god => argumentObj.damage.includes(god.damage.toLowerCase()));
		}
		if(argumentObj.range) {
			randomPool = randomPool.filter(god => argumentObj.range.includes(god.range.toLowerCase()));
		}

		if (!randomPool.length || randomPool.length == 0) {
			msg.reply('your chosen filters have resulted in 0 gods being available. Please change your filters.');
			return;
		}

		console.log(JSON.stringify(randomPool));
		const randomIndex = Math.floor((Math.random() * randomPool.length));
		console.log(randomIndex);
		const chosenGod = randomPool[randomIndex];
		console.log(JSON.stringify(chosenGod));
		const imageURL = `https://smitefire.com/images/god/icon/${chosenGod.name.replace(' ', '-').replace('\'', '')}.png`;
		console.log(imageURL);
		const colors = { Assassin: '#E5A900', Guardian: '#5A8210', Hunter: '#BD4900', Mage: '#A520A5', Warrior: '#C0250D' };
		const reply = new Discord.MessageEmbed()
			.setTitle('Here\'s your god!')
			.setColor(colors[chosenGod.class])
			.addFields(
				{ name: 'Name', value: chosenGod.name },
				{ name: 'Class', value: chosenGod.class },
				{ name: 'Pantheon', value: chosenGod.pantheon },
			)
			.setThumbnail(imageURL);
		msg.reply(reply);
	},
};

function createMatrixArrays(item) {
	const newArray = item.split(' ');
	newArray.forEach(a => a.toLowerCase());
	return newArray;
}