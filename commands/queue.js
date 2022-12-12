const {GuildMember} = require('discord.js');

module.exports = {

    name: 'queue',
    description: 'キュー内の曲の詳細を表示します',

    async execute (interaction, player) {

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
          var queue = player.getQueue(interaction.guildId);
          if (typeof(queue) != 'undefined') {
            trimString = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);
              return void interaction.reply({
                embeds: [
                  {
                    title: '再生中',
                    description: trimString(`現在再生中 🎶 | **${queue.current.title}**! \n 🎶 | ${queue}! `, 4095),
                  }
                ]
              })
          } else {
            return void interaction.reply({
              content: 'キュー内に曲がありません'
            })
          }
    }
}
