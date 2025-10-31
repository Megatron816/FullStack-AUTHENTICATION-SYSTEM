const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-that-should-be-in-a-env-file';

app.use(express.json());

const hardcodedUser = {
  id: 1,
  username: 'testuser',
  password: 'password123'
};

app.post('/login', (req, res) => {
  const { id, username, password } = req.body;

  if (id === hardcodedUser.id && 
      username === hardcodedUser.username && 
      password === hardcodedUser.password) {
    
    const payload = {
      id: hardcodedUser.id,
      username: hardcodedUser.username
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next(); 
  });
}

app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'You have accessed a protected route!',
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});