const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let tasks = [];
let users = [];

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), username, password: hashedPassword };
  users.push(user);
  res.status(201).json({ message: 'User registered successfully' });
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(403).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});


app.use(authenticateToken);


app.get('/api/tasks', (req, res) => {
  const sortedTasks = tasks.sort((a, b) => {
    const urgencyOrder = { 'Alta': 1, 'Média': 2, 'Baixa': 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
  res.json(sortedTasks);
});


app.post('/api/tasks', (req, res) => {
  const task = req.body;
  tasks.push(task);
  res.status(201).json(task);
});


app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updatedTask = req.body;
  tasks = tasks.map(task => (task.id === parseInt(id) ? updatedTask : task));
  res.json(updatedTask);
});


app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(task => task.id !== parseInt(id));
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
