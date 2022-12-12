const {GuildMember, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'remove',
  description: 'キューから曲を削除します',
  options: [
    {
      name: 'number',
      type: ApplicationCommandOptionType.Integer,
      description: '削除する曲の番号',
      required: true,
    },
  ],
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
    const number = interaction.options.getInteger('number') - 1;
    if (number > queue.tracks.length)
      return void interaction.followUp({content: '❌ | トラック数がキューの数を超えています'});
    const removedTrack = queue.remove(number);
    return void interaction.followUp({
      content: removedTrack ? `✅ |  **${removedTrack}** を削除しました` : '❌ | 問題が発生しました',
    });
  },
};
