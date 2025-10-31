const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-super-secret-key-for-rbac';

app.use(express.json());

const users = [
  {
    id: 1,
    username: 'adminUser',
    password: 'admin123',
    role: 'Admin'
  },
  {
    id: 2,
    username: 'moderatorUser',
    password: 'moderator123',
    role: 'Moderator'
  },
  {
    id: 3,
    username: 'normalUser',
    password: 'user123',
    role: 'User'
  }
];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token });
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

function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
}

app.get('/user-profile', authenticateToken, authorizeRole(['Admin', 'Moderator', 'User']), (req, res) => {
  res.status(200).json({
    message: `Welcome to your profile, ${req.user.username}!`,
    user: req.user
  });
});

app.get('/moderator-panel', authenticateToken, authorizeRole(['Admin', 'Moderator']), (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Moderator panel',
    user: req.user
  });
});

app.get('/admin-dashboard', authenticateToken, authorizeRole(['Admin']), (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Admin dashboard',
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});