const {GuildMember} = require('discord.js');

module.exports = {
  name: 'skip',
  description: '曲をスキップします',
  async execute(interaction, player) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: 'VCに接続していません',
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
    if (!queue || !queue.playing) return void interaction.followUp({content: '❌ | 曲が再生されていません'});
    const currentTrack = queue.current;
    const success = queue.skip();
    return void interaction.followUp({
      content: success ? `✅ | **${currentTrack}** をスキップしました` : '❌ | 問題が発生しました',
    });
  },
};
