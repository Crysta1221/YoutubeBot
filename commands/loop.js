const {GuildMember, ApplicationCommandOptionType} = require('discord.js');
const {QueueRepeatMode} = require('discord-player');

module.exports = {
  name: 'loop',
  description: 'ループモードを有効にします',
  options: [
    {
      name: 'mode',
      type: ApplicationCommandOptionType.Integer,
      description: 'Loop type',
      required: true,
      choices: [
        {
          name: 'Off',
          value: QueueRepeatMode.OFF,
        },
        {
          name: 'トラック',
          value: QueueRepeatMode.TRACK,
        },
        {
          name: 'キュー',
          value: QueueRepeatMode.QUEUE,
        },
        {
          name: '自動再生',
          value: QueueRepeatMode.AUTOPLAY,
        },
      ],
    },
  ],
  async execute(interaction, player) {
    try {
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
      if (!queue || !queue.playing) {
        return void interaction.followUp({content: '❌ | No music is being played!'});
      }

      const loopMode = interaction.options.getInteger('mode');
      const success = queue.setRepeatMode(loopMode);
      const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶';

      return void interaction.followUp({
        content: success ? `${mode} | Updated loop mode!` : '❌ | Could not update loop mode!',
      });
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: 'There was an error trying to execute that command: ' + error.message,
      });
    }
  },
};
