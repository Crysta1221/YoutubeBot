const {GuildMember, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'swap',
  description: 'キュー内の曲の位置を交換します',
  options: [
    {
      name: 'track1',
      type: ApplicationCommandOptionType.Integer,
      description: '交換するトラック番号',
      required: true,
    },
    {
      name: 'track2',
      type: ApplicationCommandOptionType.Integer,
      description: '交換するトラック番号',
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
    const queueNumbers = [interaction.options.getInteger('track1') - 1, interaction.options.getInteger('track2') - 1];
    // Sort so the lowest number is first for swap logic to work
    queueNumbers.sort(function (a, b) {
      return a - b;
    });
    if (queueNumbers[1] > queue.tracks.length)
      return void interaction.followUp({content: '❌ | トラック数がキューの数を超えています'});

    try {
      const track2 = queue.remove(queueNumbers[1]); // Remove higher track first to avoid list order issues
      const track1 = queue.remove(queueNumbers[0]);
      queue.insert(track2, queueNumbers[0]); // Add track in lowest position first to avoid list order issues
      queue.insert(track1, queueNumbers[1]);
      return void interaction.followUp({
        content: `✅ |  **${track1}** と **${track2}** を交換しました`,
      });
    } catch (error) {
      console.log(error);
      return void interaction.followUp({
        content: '❌ | 問題が発生しました',
      });
    }
  },
};
