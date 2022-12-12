const {GuildMember, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'move',
  description: 'キュー内の曲の再生位置を移動します',
  options: [
    {
      name: 'track',
      type: ApplicationCommandOptionType.Integer,
      description: '移動するトラック番号',
      required: true,
    },
    {
      name: 'position',
      type: ApplicationCommandOptionType.Integer,
      description: '移動先',
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
    const queueNumbers = [interaction.options.getInteger('track') - 1, interaction.options.getInteger('position') - 1];
    if (queueNumbers[0] > queue.tracks.length || queueNumbers[1] > queue.tracks.length)
      return void interaction.followUp({content: '❌ | トラック数がキューの数を超えています'});

    try {
      const track = queue.remove(queueNumbers[0]);
      queue.insert(track, queueNumbers[1]);
      return void interaction.followUp({
        content: `✅ | **${track}** を移動しました`,
      });
    } catch (error) {
      console.log(error);
      return void interaction.followUp({
        content: '❌ | トラックの移動中にエラーが発生しました',
      });
    }
  },
};
