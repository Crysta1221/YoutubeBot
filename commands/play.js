const {GuildMember, ApplicationCommandOptionType } = require('discord.js');
const {QueryType} = require('discord-player');

module.exports = {
  name: 'play',
  description: '曲を再生します',
  options: [
    {
      name: 'query',
      type: ApplicationCommandOptionType.String,
      description: '再生したい曲',
      required: true,
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

      const query = interaction.options.getString('query');
      const searchResult = await player
        .search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        })
        .catch(() => {});
      if (!searchResult || !searchResult.tracks.length)
        return void interaction.followUp({content: '結果が見つかりませんでした'});

      const queue = await player.createQueue(interaction.guild, {
        ytdlOptions: {
				quality: "highest",
				filter: "audioonly",
				highWaterMark: 1 << 30,
				dlChunkSize: 0,
			},
        metadata: interaction.channel,
      });

      try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
      } catch {
        void player.deleteQueue(interaction.guildId);
        return void interaction.followUp({
          content: 'VCに接続できませんでした',
        });
      }

      await interaction.followUp({
        content: `⏱ | 読み込み中... >>> ${searchResult.playlist ? 'playlist' : 'track'}`,
      });
      searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
      if (!queue.playing) await queue.play();
    } catch (error) {
      console.log(error);
      interaction.followUp({
        content: 'コマンド実行中に問題が発生しました: ' + error.message,
      });
    }
  },
};
