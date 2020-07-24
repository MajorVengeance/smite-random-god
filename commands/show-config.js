module.exports = {
	name: 'show-config',
	aliases: ['showconfig'],
	description: 'Shows the config for a server',
	guildOnly: true,
	args: false,
	execute(msg, args) {
		console.log(args);
		const guildConf = msg.client.settings.ensure(msg.guild.id, msg.client.defaultSettings);
		const configProps = Object.keys(guildConf).map(prop => {
			return `${prop}  :  ${guildConf[prop]}\n`;
		});
		msg.channel.send(`The following are the server's current configuration:
    \`\`\`${configProps}\`\`\``);
	},
};