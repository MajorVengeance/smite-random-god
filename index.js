const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// const QUOTE_PAIRS = {
// 	'"': '"',
// 	'\'': '\'',
// 	'‘': '’',
// 	'‚': '‛',
// 	'“': '”',
// 	'„': '‟',
// 	'⹂': '⹂',
// 	'「': '」',
// 	'『': '』',
// 	'〝': '〞',
// 	'﹁': '﹂',
// 	'﹃': '﹄',
// 	'＂': '＂',
// 	'｢': '｣',
// 	'«': '»',
// 	'‹': '›',
// 	'《': '》',
// 	'〈': '〉',
// };

client.once('ready', () => {
	console.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split('/ +/');
	const command = args.shift().toLowerCase();

	if(command === 'guild') {
		console.log('hit');
		message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
	}
	else if (command === 'args-info') {
		if (!args.length) {
			return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
		}

		message.channel.send(`Command name: ${command}\nArguments: ${args}`);
	}
	console.info(`Called command: ${command}`);

	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.channel.send(`${message.author} there was an error trying to execute that command!`);
	}
});

client.login(token);

// function getQuotedWord(word){
// 	if (word === undefined) {
// 		return null;
// 	}
// 	var close_quote = QUOTE_PAIRS[current];
// 	var isQuoted = close_quote === undefined;
// }