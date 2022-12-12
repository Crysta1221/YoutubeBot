const http = require('http');
http.createServer(function(request, response)
{
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end('Bot is online!');
}).listen(3000);

require('dotenv').config()

const token = process.env.DISCORD_TOKEN;
const fs = require('fs');
const Discord = require('discord.js');
const Client = require('./client/Client');
const config = require('./config.json');
const {Player} = require('discord-player');

const { ActivityType } = require('discord.js');

const client = new Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

console.log(client.commands);

const player = new Player(client);

player.on('error', (queue, error) => {
  console.log(`[${queue.guild.name}] キューエラーが発生しました: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
  console.log(`[${queue.guild.name}] 接続エラーが発生しました: ${error.message}`);
});

player.on('trackStart', (queue, track) => {
  queue.metadata.send(`▶ | 再生中: **${track.title}** >>> **${queue.connection.channel.name}**`);
});

player.on('trackAdd', (queue, track) => {
  queue.metadata.send(`🎶 | トラック **${track.title}** がキューに追加されました`);
});

player.on('botDisconnect', queue => {
  queue.metadata.send('❌ | 音声チャンネルから切断されました。キューが消去されました');
});

player.on('channelEmpty', queue => {
  queue.metadata.send('❌ | VC内にユーザーがいないため自動切断しました');
});

player.on('queueEnd', queue => {
  queue.metadata.send('✅ | キューが終了しました');
});

client.once('ready', async () => {
  console.log('準備完了');
});

client.on('ready', function() {
  client.user.setPresence({
    activities: [{ name: config.activity, type: Number(config.activityType) }],
    status: Discord.PresenceUpdateStatus.Online,
  });
});

client.once('reconnecting', () => {
  console.log('再接続中...');
});

client.once('disconnect', () => {
  console.log('切断しました');
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (message.content === '!deploy' && message.author.id === client.application?.owner?.id) {
    await message.guild.commands
      .set(client.commands)
      .then(() => {
        message.reply('デプロイに成功しました');
      })
      .catch(err => {
        message.reply('デプロイに失敗しました。\`application.commands\` 権限があるか確認してください。');
        console.error(err);
      });
  }
});

client.on('interactionCreate', async interaction => {
  const command = client.commands.get(interaction.commandName.toLowerCase());

  try {
    if (interaction.commandName == 'ban' || interaction.commandName == 'userinfo') {
      command.execute(interaction, client);
    } else {
      command.execute(interaction, player);
    }
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: 'コマンド実行中にエラーが発生しました',
    });
  }
});

client.login(token);
