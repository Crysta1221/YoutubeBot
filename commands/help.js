const fs = require('fs');

module.exports = {
  name: 'help',
  description: '実行可能なコマンドリストを表示します',
  execute(interaction) {
    let str = '';
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`./${file}`);
      str += `名前: ${command.name}, 説明: ${command.description} \n`;
    }

    return void interaction.reply({
      content: str,
      ephemeral: true,
    });
  },
};
