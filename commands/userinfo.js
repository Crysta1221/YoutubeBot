const {ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'ユーザー情報を取得します',
  options: [
    {
      name: 'user',
      type: ApplicationCommandOptionType.User,
      description: '情報を取得するユーザー',
      required: true,
    },
  ],
  execute(interaction, client) {
    const user = interaction.options.getUser('user');

    interaction.reply({
      content: `名前: ${user.username}, ID: ${user.id}, アバター: ${user.displayAvatarURL({dynamic: true})}`,
      ephemeral: true,
    });
  },
};
