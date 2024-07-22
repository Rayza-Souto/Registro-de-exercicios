const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/user');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://rayzasouto:juliano0210@cluster0.f3blj7t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// Rota para criar um novo usuário
app.post('/api/users', async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Rota para obter todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Rota para adicionar um exercício a um usuário
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).send('Usuário não encontrado');

    const exercise = {
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date ? new Date(req.body.date) : new Date()
    };

    user.exercises.push(exercise);
    await user.save();

    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Rota para obter o registro de exercícios de um usuário
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).send('Usuário não encontrado');

    let { from, to, limit } = req.query;
    from = from ? new Date(from) : new Date(0);
    to = to ? new Date(to) : new Date();

    const log = user.exercises
      .filter(ex => ex.date >= from && ex.date <= to)
      .slice(0, limit ? parseInt(limit) : user.exercises.length)
      .map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }));

    res.json({
      _id: user._id,
      username: user.username,
      count: log.length,
      log: log
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
