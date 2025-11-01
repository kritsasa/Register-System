const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Used to generate and verify tokens for login systems.
const cors = require('cors'); // Enable frontends from other domains to send requests to the backend.
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET // Secret key for JWT, should be stored in environment variables.

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => { // Connect to SQLite database if is not exists create new file.
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

db.run(`CREATE TABLE IF NOT EXISTS users ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
)`)

// Middleware for verifying JWT tokens
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Get the Authorization header from the request
    const  token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

    if (token == null) {
        return res.status(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => { // Verify the token using the secret key
        if (err) {
            return res.status(403);
        }
        req.user = user; // Attach the user information to the request object
        next();
    });
}

// Protected Dashboard Route
// /api is added to differentiate API routes from other potential routes.
app.get('/api/dashboard', verifyToken, (req, res) => { // Use the verifyToken middleware to protect this route
    const username = req.user.username;

    res.json({ message: `Welcome to your dashboard, ${username}!` });
});

// API endpoint to register a new user

// Register endpoint
app.post('/register', async (req, res) => {
    const { username , password } = req.body; // Get username and password from request body Ex: { "username": "user1", "password": "pass123" }

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before storing it
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'; // Prepare SQL statement to insert new user // Use ? to replace the value to be passed later.(Protection SQL Injection)

    db.run(sql, [username, hashedPassword], function(err) { // Run the SQL statement with the provided username and hashed password
        if (err) {
            if (err.errno === 19) { // Unique constraint failed (username already exists)
                return res.status(409).json({ message: 'Username already exists' });
            }
            return res.status(500).json({ message: 'Internal server error' }); // Other errors
        }

        res.status(201).json({ message: 'User registered successfully', userId: this.lastID }); // Respond with success message and the new user's ID
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?'; // Prepare SQL statement to select user by username

    db.get(sql, [username], async (err, user) => { // Run the SQL statement with the provided username
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password); // Compare provided password with the stored hashed password
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        // jwt.sign(payload, secretOrPrivateKey, [options])
        // { id: user.id, username: user.username } is the payload that will be encoded in the token. (Do not enter passwords or other confidential information directly.)
        // JWT_SECRET is the secret key used to sign the token.
        // { expiresIn: '1h' } sets the token to expire in 1 hour.

        res.json({ message: 'Login successfuly', token  });
    })
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
