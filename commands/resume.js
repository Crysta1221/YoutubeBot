const {GuildMember} = require('discord.js');

module.exports = {
  name: 'resume',
  description: '曲を再開します',
  async execute(interaction, player) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: 'あなたはVCに接続していません',
        ephemeral: true,
      });
    }

    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.members.me.voice.channelId
    ) {
      return void interaction.reply({
        content: 'あなたはVCに接続していません',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | 曲が再生されていません',
      });
    const success = queue.setPaused(false);
    return void interaction.followUp({
      content: success ? '▶ | 曲を再開しました' : '❌ | 問題が発生しました',
    });
  },
};
