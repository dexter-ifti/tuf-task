const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Create users table if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'regular') NOT NULL DEFAULT 'regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
    if (err) {
        console.error('Error creating users table:', err);
    } else {
        console.log('Users table created or already exists');
    }
});

// Create flashcards table if not exists
db.query(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`, (err) => {
    if (err) {
        console.error('Error creating flashcards table:', err);
    } else {
        console.log('Flashcards table created or already exists');
    }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

// Auth Routes
app.post('/api/signup', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creating user' });
        } else {
            res.status(201).json({ message: 'User created successfully' });
        }
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error during login' });
        } else if (results.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
        } else {
            const user = results[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        }
    });
});

// Flashcard Routes
app.get('/api/flashcards', verifyToken, (req, res) => {
    db.query('SELECT * FROM flashcards', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching flashcards' });
        } else {
            res.json(results);
        }
    });
});

app.get('/api/flashcards/:id', verifyToken, (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM flashcards WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching flashcard' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Flashcard not found' });
        } else {
            res.json(results[0]);
        }
    });
});

app.post('/api/flashcards', verifyToken, isAdmin, (req, res) => {
    const { question, answer } = req.body;
    db.query('INSERT INTO flashcards (question, answer) VALUES (?, ?)', [question, answer], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error creating flashcard' });
        } else {
            res.status(201).json({ id: result.insertId, question, answer });
        }
    });
});

app.put('/api/flashcards/:id', verifyToken, isAdmin, (req, res) => {
    const id = req.params.id;
    const { question, answer } = req.body;
    db.query('UPDATE flashcards SET question = ?, answer = ? WHERE id = ?', [question, answer, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error updating flashcard' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Flashcard not found' });
        } else {
            res.json({ id, question, answer });
        }
    });
});

app.delete('/api/flashcards/:id', verifyToken, isAdmin, (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM flashcards WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error deleting flashcard' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Flashcard not found' });
        } else {
            res.status(204).json({ msg: "Deleted" });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});