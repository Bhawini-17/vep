const bcrypt = require('bcrypt');

async function generateHash() {
  const plainPassword = 'demo@123';
  const saltRounds = 12;
  const hashed = await bcrypt.hash(plainPassword, saltRounds);
  console.log('Hashed Password:', hashed);
}

generateHash();