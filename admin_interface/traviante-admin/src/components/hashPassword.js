const bcrypt = require('bcrypt');


async function hashPassword() {
  const password = 'admin123'; // Replace with your desired admin password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);
    console.log('Use this hashed password to update your admin user in the database');
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

hashPassword();