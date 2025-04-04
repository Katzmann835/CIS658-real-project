const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Application = express();
const port = 3001;

Application.use(cors());
Application.use(express.json());

const db = new sqlite3.Database('./appdb.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the sqlite3 database');
});
db.run('CREATE TABLE IF NOT EXISTS App (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');

Application.get('/App', (req, res) => {
    db.all('SELECT * FROM App', [], (err, rows) => {
        if (err) {
            res.status(400).send({error: err.message});
            return;
        }
        res.json({App: rows});
    })
    res.json({message: 'App works as intended'});
});

const appUser = [db];

Application.post('/App', (req, res) => {
    const { new_obj } = req.body;
    db.run('INSERT INTO App(new_obj) VALUES(?)', [new_obj], function(err){
        if (err) {
            res.status(400).send({error: err.message});
            return;
        }
        res.json({id: this.lastID});
    });
    res.json({message: 'App works as intended'});
});

Application.post('/App', async (req, res) => {
    const {username, password} = req.body;
    const newUser = appUser.find(n => n.username === username);
    if (!newUser){
        return res.status(400).json({message: 'Login Failed'});
    }
    const newPassword = await bcrypt.compare(password, newUser.hashedPassword);
    if (!newPassword){
        return res.status(400).json({message: 'Login Failed'});
    }

    const token = jwt.sign({userId: newUser.id}, 'new_key', {expiresIn: '30m'});
    res.status(200).json({message: 'Login success!', token: token});
});

Application.delete('/App/:id', (req, res) => {
    db.run('DELETE FROM App WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            res.status(400).send({error: err.message});
            return;
        }
        res.json({changes: this.changes})
    });
});

Application.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});