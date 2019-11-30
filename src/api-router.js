const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    greetings: 'Hi'
  });
});

router.get('/tasks', (req, res) => {
  res.json([
    { id: 1, text: 'Item 1', done: false },
    { id: 2, text: 'Item 2', done: false },
    { id: 3, text: 'Item 3', done: true }
  ]);
});

module.exports = router;
