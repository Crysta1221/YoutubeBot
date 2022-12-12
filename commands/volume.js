const {GuildMember, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
  name: 'volume',
  description: 'ボリュームを変更します',
  options: [
    {
      name: 'volume',
      type: ApplicationCommandOptionType.Integer,
      description: '0-200の間の番号',
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
    if (!queue || !queue.playing)
      return void interaction.followUp({
        content: '❌ | 曲が再生されていません',
      });

    var volume = interaction.options.getInteger('volume');
    volume = Math.max(0, volume);
    volume = Math.min(200, volume);
    const success = queue.setVolume(volume);

    return void interaction.followUp({
      content: success ? `🔊 | ボリュームを ${volume} に設定しました` : '❌ | 問題が発生しました',
    });
  },
};
