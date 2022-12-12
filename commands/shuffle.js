const {GuildMember} = require('discord.js');

module.exports = {
  name: 'shuffle',
  description: 'キュー内をシャッフルします',
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
    if (!queue || !queue.playing) return void interaction.followUp({content: '❌ | 曲が再生されていません'});
    try {
      queue.shuffle();
      trimString = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
      return void interaction.followUp({
        embeds: [
          {
            title: '再生中',
            description: trimString(
              `現在再生中 >>> 🎶 | **${queue.current.title}**! \n 🎶 | ${queue} `,
              4095,
            ),
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return void interaction.followUp({
        content: '❌ | 問題が発生しました',
      });
    }
  },
};
