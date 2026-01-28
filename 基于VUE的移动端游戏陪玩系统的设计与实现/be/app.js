const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(require('./middleware/response'));

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const companionRoutes = require('./routes/companion');
const orderRoutes = require('./routes/order');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/companions', companionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Play Companion Server is Running' });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ code: 500, msg: 'Something broke!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
