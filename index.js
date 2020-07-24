const fs = require('fs');
const Discord = require('discord.js');
const { token } = require('./config.json');
const Enmap = require('enmap');
const defaultSettings = require('./config.json').default;

const client = new Discord.Client();
client.commands = new Discord.Collection();
const settingsObj = new Enmap({
	name: 'settings',
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
});

client.settings = settingsObj;
client.defaultSettings = defaultSettings;
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', () => {
	console.info(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
	const guildConf = client.settings.ensure(message.member.guild.id, defaultSettings);
	if (!message.content.startsWith(guildConf.prefix) || message.author.bot) return;

	const args = message.content.slice(guildConf.prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if(!command) return;

	if(command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if(command.args && !args.length) {
		return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
	}

	if(!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if(timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id, cooldownAmount));

	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.channel.send(`${message.author} there was an error trying to execute that command!`);
	}
});

client.login(token);