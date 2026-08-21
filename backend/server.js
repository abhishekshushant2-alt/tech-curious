require('dotenv').config();
const express = require('express');
const cors = require('cors');

const projectsRouter = require('./routes/projects');
const authRouter = require('./routes/auth');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
  })
);
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Tech Curious API is running.');
});

// Basic error handler (e.g. Multer file-type/size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Tech Curious backend running on http://localhost:${PORT}`);
});
