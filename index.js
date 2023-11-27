const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8000;

const upload = multer(); s

app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

app.get('/notes', (req, res) => {
  const notes = loadNotes();
  res.json(notes);
});

app.post('/upload', upload.single('file'), (req, res) => {
  const { note_name, note } = req.body;

  const notes = loadNotes();

  if (notes.some((existingNote) => existingNote.name === note_name)) {
    return res.status(400).json({ error: 'Note with the same name already exists' });
  }

  notes.push({ name: note_name, text: note });
  saveNotes(notes);

  res.status(201).json({ message: 'Note created successfully' });
});


app.get('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notes = loadNotes();

  const note = notes.find((n) => n.name === noteName);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  res.send(note.text);
});

app.put("/notes/:noteName", express.text(), (req, res) => {
  const noteName = req.params.noteName;
  const updatedNoteText = req.body;

  const notes = loadNotes();

  const index = notes.findIndex((note) => note.name === noteName);

  if (index !== -1) {
    notes[index].text = updatedNoteText;
    saveNotes(notes);
    res.status(200).send("Note successfully updated");
  } else {
    res.status(404).send("Note not found");
  }
});

app.delete('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;

  const notes = loadNotes();

  const filteredNotes = notes.filter((n) => n.name !== noteName);

  if (filteredNotes.length === notes.length) {
    return res.status(404).json({ error: 'Note not found' });
  }

  saveNotes(filteredNotes);

  res.json({ message: 'Note deleted successfully' });
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});

function saveNotes(notes) {
  const data = JSON.stringify(notes, null, 2);
  fs.writeFileSync(path.join(__dirname, 'notes.json'), data);
}

function loadNotes() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'notes.json'), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
