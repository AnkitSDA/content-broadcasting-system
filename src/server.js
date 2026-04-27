require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Public API: http://localhost:${PORT}/content/live/:teacherId`);
  console.log(`🔒 Auth API:   http://localhost:${PORT}/api/auth`);
});
