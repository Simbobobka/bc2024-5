const express = require('express');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const program = new Command();
const getNotePath = (noteName) => path.join(cache, `${noteName}.txt`);
const form_note = `
    <html>
    <body>
        <h2>Upload Form</h2>
            <form method="post" action="/write" enctype="multipart/form-data">
                <label for="note_name_input">Note Name:</label><br>
                <input type="text" id="note_name_input" name="note_name"><br><br>
                <label for="note_input">Note:</label><br>
                <textarea id="note_input" name="note" rows="4" cols="50"></textarea><br><br>
                <button>Upload</button>
            </form>
    </body>
    </html>
`

program
  .requiredOption('-h, --host <type>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера', parseInt)
  .requiredOption('-c, --cache <path>', 'шлях до директорії для кешу');

program.parse(process.argv);

const options = program.opts();

const app = express();
const { host, port, cache } = options;

app.use(bodyParser.json());

// допоміжні функції для операцій з файлами
const readNote = (noteName) => {
  const notePath = getNotePath(noteName);
  if (!fs.existsSync(notePath)) return null;
  return fs.readFileSync(notePath, 'utf8');
};

const writeNote = (noteName, text) => {
  const notePath = getNotePath(noteName);
  fs.writeFileSync(notePath, text, 'utf8');
};

const deleteNote = (noteName) => {
  const notePath = getNotePath(noteName);
  if (fs.existsSync(notePath)) fs.unlinkSync(notePath);
};
// -------------------------------------------------

app.get('/notes/:noteName', (req, res) => {
    const noteContent = readNote(req.params.noteName);
    if (!noteContent) return res.status(404).send('Not found');
    res.send(noteContent);
});

app.put('/notes/:note_name', upload.none(), (req, res) => {
    const noteName = req.params.note_name;
    const { note } = req.body;
  
    if (!readNote(noteName)) {
      return res.status(404).send('Note not found');
    }
  
    writeNote(noteName, note);
    res.status(200).send('Note updated');
  });

app.delete('/notes/:noteName', (req, res) => {
    const { noteName } = req.params;
    if (!readNote(noteName)) return res.status(404).send('Not found');
    deleteNote(noteName);
    res.sendStatus(200);
});

app.get('/notes', (req, res) => {
    const notes = fs.readdirSync(cache)
      .filter(file => file.endsWith('.txt'))
      .map(file => {
        const name = file.slice(0, -4);
        const text = readNote(name);
        return { name, text };
      });
    res.status(200).json(notes);
  });

app.post('/write', upload.none(), (req, res) => {
    const { note_name, note } = req.body;
    if (readNote(note_name)) return res.status(400).send('Note already exists');
    writeNote(note_name, note);
    res.status(201).send('Created');
});

app.get('/UploadForm.html', (req, res) => {
    res.send(`
    <html>
    <body>
        <h2>Upload Form</h2>
            <form method="post" action="/write" enctype="multipart/form-data">
                <label for="note_name_input">Note Name:</label><br>
                <input type="text" id="note_name_input" name="note_name"><br><br>
                <label for="note_input">Note:</label><br>
                <textarea id="note_input" name="note" rows="4" cols="50"></textarea><br><br>
                <button>Upload</button>
            </form>
    </body>
    </html>
`);
});

app.listen(port, host, () => {
    console.log(`Сервер запущено на http://${host}:${port}`);
    console.log(`Кеш директорія: ${cache}`);
});