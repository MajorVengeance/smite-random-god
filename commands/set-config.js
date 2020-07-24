module.exports = {
	name: 'set-config',
	aliases: ['setconfig', 'update-config'],
	description: 'Reloads a command',
	guildOnly: true,
	args: true,
	execute(msg, args) {
		if(msg.member.hasPermission('ADMINISTRATOR') || msg.member.hasPermission('MANAGE_GUILD')) {
			const [prop, ...value] = args;
			if(!msg.client.settings.has(msg.guild.id, prop)) {
				return msg.reply('This key is not in the configuration.');
			}

			msg.client.settings.set(msg.guild.id, value.join(' '), prop);

			msg.channel.send(`Guild configuration item ${prop} has been changed to: \n\`${value.join(' ')}\``);
		}
		else{
			msg.reply('you do not have permission to use this command');
		}
	},
};