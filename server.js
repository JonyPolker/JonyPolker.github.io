const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Указываем серверу, что файлы из папки public должны быть доступны
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());                   // для JSON-запросов

// 📄 Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ РЕГИСТРАЦИЯ
app.post('/register', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Имя и email обязательны' });
  }

  const registration = {
    name,
    email,
    time: new Date().toISOString()
  };

  const registrationsPath = path.join(__dirname, 'registrations.json');

  let all = [];
  if (fs.existsSync(registrationsPath)) {
    all = JSON.parse(fs.readFileSync(registrationsPath));
  }

  all.push(registration);
  fs.writeFileSync(registrationsPath, JSON.stringify(all, null, 2));

  res.json({ message: 'Регистрация успешна!' });
});

// 📥 СКАЧИВАНИЕ с логированием
app.post('/download', (req, res) => {
  const { email, file } = req.body;

  if (!email || !file) {
    return res.status(400).send('Email и имя файла обязательны');
  }

  const filePath = path.join(__dirname, 'public', 'files', file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Файл не найден');
  }

  // логируем
  const logLine = `${new Date().toISOString()} - ${email} скачал ${file}\n`;
  fs.appendFileSync('downloads.log', logLine);

  res.download(filePath, file);
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
