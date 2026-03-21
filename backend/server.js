const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plm-hackathon')
  .then(async () => {
    console.log('MongoDB Connected');

    // Seed Hackathon Users
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const users = [
      { email: 'engineer@plm.com', role: 'Engineer' },
      { email: 'approver@plm.com', role: 'Approver' },
      { email: 'admin@plm.com', role: 'Admin' },
      { email: 'operations@plm.com', role: 'Operations' }
    ];
    for (let u of users) {
      if (!(await User.findOne({ email: u.email }))) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        await new User({ email: u.email, password: hashedPassword, role: u.role }).save();
        console.log(`Seeded user: ${u.email}`);
      }
    }
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the PLM API' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/eco', require('./routes/eco'));
app.use('/api/bom', require('./routes/bom'));
app.use('/api/audit', require('./routes/audit'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
