const express = require('express');
const { Command } = require('commander');
const program = new Command();

program
  .requiredOption('-h, --host <type>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера', parseInt)
  .requiredOption('-c, --cache <path>', 'шлях до директорії для кешу');

program.parse(process.argv);

const options = program.opts();
const app = express();
const { host, port, cache } = options;

app.get('/', (req, res) => {
  res.send('Сервер працює');
});

app.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
  console.log(`Кеш директорія: ${cache}`);
});