const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3006'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl requests
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      // Origin is allowed
      callback(null, true);
    } else {
      // Origin is not allowed
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cookieParser());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});



// Middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.admin = admin;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
//  new customer registration
app.post('/api/customers', async (req, res) => {
  const { first_name, last_name, email, phone_number, address, password } = req.body;

  // Check if password is provided
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = 'INSERT INTO Customers (first_name, last_name, email, phone_number, address, password) VALUES (?, ?, ?, ?, ?, ?)';
    
    db.query(query, [first_name, last_name, email, phone_number, address, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error creating customer:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Error creating customer' });
      }
      res.status(201).json({ message: 'Customer created successfully', customerId: result.insertId });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Error creating customer' });
  }
});
// Fetch all customers
app.get('/api/admin/customers', authenticateAdmin, (req, res) => {
  console.log('Received request for /api/admin/customers');
  const query = 'SELECT customer_id, first_name, last_name, email, phone_number, address FROM Customers';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ error: 'Error fetching customers' });
    } else {
      console.log('Sending customers data:', results);
      res.json({ customers: results });
    }
  });
});

// Add a new customer
app.post('/api/admin/customers', authenticateAdmin, async (req, res) => {
  const { first_name, last_name, email, phone_number, address } = req.body;
  const query = 'INSERT INTO Customers (first_name, last_name, email, phone_number, address) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [first_name, last_name, email, phone_number, address], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Error creating customer' });
    }
    res.status(201).json({ message: 'Customer created successfully' });
  });
});

// Update a customer
app.put('/api/admin/customers/:id', authenticateAdmin, async (req, res) => {
  const { first_name, last_name, email, phone_number, address } = req.body;
  const query = 'UPDATE Customers SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ? WHERE customer_id = ?';
  db.query(query, [first_name, last_name, email, phone_number, address, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error updating customer' });
    }
    res.json({ message: 'Customer updated successfully' });
  });
});

// Delete a customer
app.delete('/api/admin/customers/:id', authenticateAdmin, (req, res) => {
  const query = 'DELETE FROM Customers WHERE customer_id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting customer' });
    } else {
      res.json({ message: 'Customer deleted successfully' });
    }
  });
});


// Search destinations
app.get('/api/search', (req, res) => {
  const searchQuery = req.query.q;
  const sql = `
    SELECT 
      d.destination_id, 
      d.destination_name, 
      d.image, 
      p.base_price, 
      p.currency 
    FROM 
      Destinations d
    JOIN 
      Package_Destinations pd ON d.destination_id = pd.destination_id
    JOIN 
      Packages p ON pd.package_id = p.package_id
    WHERE 
      d.destination_name LIKE ?
  `;
  db.query(sql, [`%${searchQuery}%`], (err, results) => {
    if (err) {
      console.error('Error fetching search results:', err);
      return res.status(500).json({ error: 'Error fetching search results' });
    }
    res.json(results);
  });
});

app.get('/api/popular-destinations', (req, res) => {
  const sql = 'SELECT destination_id, destination_name, image FROM Destinations LIMIT 8'; // Adjust LIMIT based on your needs
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching destinations' });
    }
    res.json(results);
  });
});

app.post('/api/admin/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // Store username and hashedPassword in the database
    // ...
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating admin' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const query = 'SELECT * FROM admins WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const admin = results[0];
    try {
      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (bcryptErr) {
      console.error('Bcrypt error:', bcryptErr);
      res.status(500).json({ error: 'Error comparing passwords' });
    }
  });
});

// Test bcrypt
bcrypt.compare('admin123', '$2b$10$5dwsS5snIRlKu8ka6c5sFOX9hYXzLxBmcIdz1GYzer0nYOGpbQEjK', (err, result) => {
  if (err) {
    console.error('Bcrypt test error:', err);
  } else {
    console.log('Bcrypt test result:', result); // This should log true
  }
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

// Fetch all destinations
app.get('/api/destinations', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;

  const countQuery = 'SELECT COUNT(*) as total FROM Destinations';
  const dataQuery = 'SELECT * FROM Destinations ORDER BY destination_id DESC LIMIT ? OFFSET ?';

  db.query(countQuery, (err, countResults) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching destinations count' });
    } else {
      const total = countResults[0].total;
      db.query(dataQuery, [limit, offset], (err, results) => {
        if (err) {
          res.status(500).json({ error: 'Error fetching destinations' });
        } else {
          res.json({
            destinations: results,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total
          });
        }
      });
    }
  });
});

// Add a new destination
app.post('/api/admin/destinations', authenticateAdmin, upload.single('image'), (req, res) => {
  const { destination_name, country, city } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const query = 'INSERT INTO Destinations (destination_name, country, city, image) VALUES (?, ?, ?, ?)';
  db.query(query, [destination_name, country, city, image], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error adding destination' });
    } else {
      res.json({ destination_id: result.insertId, message: 'Destination added successfully' });
    }
  });
});

// Update a destination
app.put('/api/admin/destinations/:id', authenticateAdmin, upload.single('image'), (req, res) => {
  const { destination_name, country, city } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  const query = 'UPDATE Destinations SET destination_name = ?, country = ?, city = ?, image = ? WHERE destination_id = ?';
  db.query(query, [destination_name, country, city, image, req.params.id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating destination' });
    } else {
      res.json({ message: 'Destination updated successfully' });
    }
  });
});


app.delete('/api/admin/destinations/:id', authenticateAdmin, (req, res) => {
  const query = 'DELETE FROM Destinations WHERE id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting destination' });
    } else {
      res.json({ message: 'Destination deleted successfully' });
    }
  });
});


// User login
app.post('/api/user/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  if (!emailOrPhone || !password) {
    return res.status(400).json({ error: 'Email/Phone and password are required' });
  }

  const query = 'SELECT * FROM Customers WHERE email = ? OR phone_number = ?';
  db.query(query, [emailOrPhone, emailOrPhone], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign(
          { id: user.customer_id, email: user.email, phone_number: user.phone_number },
          process.env.JWT_SECRET,
          { expiresIn: '7d' } // Token expires in 7 days
        );
        
        // Set HTTP-only cookie
        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
          user: {
            id: user.customer_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (bcryptErr) {
      console.error('Bcrypt error:', bcryptErr);
      res.status(500).json({ error: 'Error comparing passwords' });
    }
  });
});
app.post('/api/user/google-login', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists in your database
    // If not, create a new user
    // Then, create a session or JWT for the user

    // For example:
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, picture });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({ error: 'Invalid Google token' });
  }
});
// User logout
app.post('/api/user/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'No token provided' });
  }
};

// User profile (replaces the old verify endpoint)
app.get('/api/user/profile', authenticateUser, (req, res) => {
  const query = 'SELECT customer_id, first_name, last_name, email, phone_number FROM Customers WHERE customer_id = ?';
  db.query(query, [req.user.id], (dbErr, results) => {
    if (dbErr) {
      console.error('Database error:', dbErr);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = results[0];
    res.json({ user });
  });
});
// Additional routes for the new tables

// Fetch all packages
app.get('/api/packages', (req, res) => {
  const query = 'SELECT * FROM Packages';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching packages:", err);
      res.status(500).json({ error: 'Error fetching packages' });
    } else {
      res.json({ packages: results });
    }
  });
});

// Fetch package details
app.get('/api/packages/:package_id', (req, res) => {
  const query = 'SELECT * FROM Packages WHERE package_id = ?';
  db.query(query, [req.params.package_id], (err, results) => {
    if (err) {
      console.error("Error fetching package details:", err);
      res.status(500).json({ error: 'Error fetching package details' });
    } else {
      res.json({ package: results[0] });
    }
  });
});

// Add a new package
app.post('/api/admin/packages', authenticateAdmin, (req, res) => {
  const { package_name, description, package_type, duration, start_date, end_date, base_price, currency } = req.body;
  const query = 'INSERT INTO Packages (package_name, description, package_type, duration, start_date, end_date, base_price, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [package_name, description, package_type, duration, start_date, end_date, base_price, currency], (err, result) => {
    if (err) {
      console.error("Error adding package:", err);
      res.status(500).json({ error: 'Error adding package', details: err.message });
    } else {
      res.json({ package_id: result.insertId, message: 'Package added successfully' });
    }
  });
});

// Update a package
app.put('/api/admin/packages/:package_id', authenticateAdmin, (req, res) => {
  const { package_name, description, package_type, duration, start_date, end_date, base_price, currency } = req.body;
  const query = 'UPDATE Packages SET package_name = ?, description = ?, package_type = ?, duration = ?, start_date = ?, end_date = ?, base_price = ?, currency = ? WHERE package_id = ?';
  db.query(query, [package_name, description, package_type, duration, start_date, end_date, base_price, currency, req.params.package_id], (err, result) => {
    if (err) {
      console.error("Error updating package:", err);
      res.status(500).json({ error: 'Error updating package', details: err.message });
    } else {
      res.json({ message: 'Package updated successfully' });
    }
  });
});

// Delete a package
app.delete('/api/admin/packages/:package_id', authenticateAdmin, (req, res) => {
  const query = 'DELETE FROM Packages WHERE package_id = ?';
  db.query(query, [req.params.package_id], (err, result) => {
    if (err) {
      console.error("Error deleting package:", err);
      res.status(500).json({ error: 'Error deleting package', details: err.message });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Package not found' });
      } else {
        res.json({ message: 'Package deleted successfully' });
      }
    }
  });
});

// Fetch all reviews for a package
app.get('/api/packages/:id/reviews', (req, res) => {
  const query = 'SELECT * FROM reviews WHERE package_id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching reviews' });
    } else {
      res.json({ reviews: results });
    }
  });
});

// Add a review for a package
app.post('/api/packages/:id/reviews', (req, res) => {
  const { customerName, rating, review, reviewDate } = req.body;
  const query = 'INSERT INTO reviews (package_id, customerName, rating, review, reviewDate) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [req.params.id, customerName, rating, review, reviewDate], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error adding review' });
    } else {
      res.json({ id: result.insertId, message: 'Review added successfully' });
    }
  });
});

// Fetch all bookings for a user
app.get('/api/user/:id/bookings', (req, res) => {
  const query = 'SELECT * FROM bookings WHERE customer_id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching bookings' });
    } else {
      res.json({ bookings: results });
    }
  });
});

// Add a booking
app.post('/api/user/:id/bookings', (req, res) => {
  const { packageId, bookingDate, status, totalPrice } = req.body;
  const query = 'INSERT INTO bookings (package_id, customer_id, bookingDate, status, totalPrice) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [packageId, req.params.id, bookingDate, status, totalPrice], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error adding booking' });
    } else {
      res.json({ id: result.insertId, message: 'Booking added successfully' });
    }
  });
});

// Fetch all payments for a booking
app.get('/api/bookings/:id/payments', (req, res) => {
  const query = 'SELECT * FROM payments WHERE booking_id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching payments' });
    } else {
      res.json({ payments: results });
    }
  });
});
// Add a payment for a booking
app.post('/api/bookings/:id/payments', (req, res) => {
  const { paymentDate, amount, paymentMethod, transactionId } = req.body;
  const query = 'INSERT INTO payments (booking_id, paymentDate, amount, paymentMethod, transactionId) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [req.params.id, paymentDate, amount, paymentMethod, transactionId], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error adding payment' });
    } else {
      res.json({ id: result.insertId, message: 'Payment added successfully' });
    }
  });
});

// Fetch all accommodations
app.get('/api/accommodations', (req, res) => {
  const query = 'SELECT * FROM Accommodations';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching accommodations' });
    } else {
      res.json({ accommodations: results });
    }
  });
});

// Fetch accommodation details
app.get('/api/accommodations/:accommodation_id', (req, res) => {
  const query = 'SELECT * FROM Accommodations WHERE accommodation_id = ?';
  db.query(query, [req.params.accommodation_id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching accommodation details' });
    } else {
      res.json({ accommodation: results[0] });
    }
  });
});

// Add a new accommodation
app.post('/api/admin/accommodations', authenticateAdmin, (req, res) => {
  const { hotel_name, hotel_rating, room_type, meals_included, amenities } = req.body;
  console.log("Received data:", req.body);  // Log the received data

  const query = 'INSERT INTO Accommodations (hotel_name, hotel_rating, room_type, meals_included, amenities) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [hotel_name, hotel_rating, room_type, meals_included, amenities], (err, result) => {
    if (err) {
      console.error("Database error:", err);  // Log any database errors
      res.status(500).json({ error: 'Error adding accommodation', details: err.message, stack: err.stack });
    } else {
      console.log("Insert result:", result);  // Log successful insert
      res.json({ id: result.insertId, message: 'Accommodation added successfully' });
    }
  });
});

// Update an accommodation
app.put('/api/admin/accommodations/:accommodation_id', authenticateAdmin, (req, res) => {
  const { hotel_name, hotel_rating, room_type, meals_included, amenities } = req.body;
  const query = 'UPDATE Accommodations SET hotel_name = ?, hotel_rating = ?, room_type = ?, meals_included = ?, amenities = ? WHERE accommodation_id = ?';
  db.query(query, [hotel_name, hotel_rating, room_type, meals_included, amenities, req.params.accommodation_id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating accommodation' });
    } else {
      res.json({ message: 'Accommodation updated successfully' });
    }
  });
});

// Delete an accommodation
app.delete('/api/admin/accommodations/:accommodation_id', authenticateAdmin, (req, res) => {
  const query = 'DELETE FROM Accommodations WHERE accommodation_id = ?';
  db.query(query, [req.params.accommodation_id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting accommodation' });
    } else {
      res.json({ message: 'Accommodation deleted successfully' });
    }
  });
});

// Fetch all itineraries
app.get('/api/itineraries', (req, res) => {
  const query = 'SELECT * FROM Itineraries';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching itineraries:", err);
      res.status(500).json({ error: 'Error fetching itineraries', details: err.message });
    } else {
      res.json({ itineraries: results });
    }
  });
});

// Add an itinerary
app.post('/api/admin/itineraries', authenticateAdmin, (req, res) => {
  const { package_id, day, description, inclusions, exclusions } = req.body;
  const query = 'INSERT INTO Itineraries (package_id, day, description, inclusions, exclusions) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [package_id, day, description, inclusions, exclusions], (err, result) => {
    if (err) {
      console.error("Error adding itinerary:", err);
      res.status(500).json({ error: 'Error adding itinerary', details: err.message });
    } else {
      res.json({ itinerary_id: result.insertId, message: 'Itinerary added successfully' });
    }
  });
});

// Update an itinerary
app.put('/api/admin/itineraries/:itinerary_id', authenticateAdmin, (req, res) => {
  const { package_id, day, description, inclusions, exclusions } = req.body;
  const query = 'UPDATE Itineraries SET package_id = ?, day = ?, description = ?, inclusions = ?, exclusions = ? WHERE itinerary_id = ?';
  db.query(query, [package_id, day, description, inclusions, exclusions, req.params.itinerary_id], (err, result) => {
    if (err) {
      console.error("Error updating itinerary:", err);
      res.status(500).json({ error: 'Error updating itinerary', details: err.message });
    } else {
      res.json({ message: 'Itinerary updated successfully' });
    }
  });
});

// Delete an itinerary
app.delete('/api/admin/itineraries/:itinerary_id', authenticateAdmin, (req, res) => {
  const query = 'DELETE FROM Itineraries WHERE itinerary_id = ?';
  db.query(query, [req.params.itinerary_id], (err, result) => {
    if (err) {
      console.error("Error deleting itinerary:", err);
      res.status(500).json({ error: 'Error deleting itinerary', details: err.message });
    } else {
      res.json({ message: 'Itinerary deleted successfully' });
    }
  });
});
// Fetch all discounts for a package
app.get('/api/admin/discounts', authenticateAdmin, (req, res) => {
  const query = 'SELECT * FROM Discounts WHERE package_id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error fetching discounts' });
    } else {
      res.json({ discounts: results });
    }
  });
});

// Add a discount for a package
app.post('/api/admin/discounts', authenticateAdmin, (req, res) => {
  const { discount_type, discount_value, start_date, end_date } = req.body;
  const query = 'INSERT INTO Discounts (package_id, discount_type, discount_value, start_date, end_date) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [req.params.id, discount_type, discount_value, start_date, end_date], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error adding discount' });
    } else {
      res.json({ discount_id: result.insertId, message: 'Discount added successfully' });
    }
  });
});

// Update a discount
app.put('/api/admin/discounts/:id', authenticateAdmin, (req, res) => {
  const { discount_type, discount_value, start_date, end_date } = req.body;
  const query = 'UPDATE Discounts SET discount_type = ?, discount_value = ?, start_date = ?, end_date = ? WHERE discount_id = ?';
  db.query(query, [discount_type, discount_value, start_date, end_date, req.params.id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error updating discount' });
    } else {
      res.json({ message: 'Discount updated successfully' });
    }
  });
});

// Delete a discount
app.delete('/api/admin/discounts/:id', authenticateAdmin, (req, res) => {
  const query = 'DELETE FROM Discounts WHERE discount_id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error deleting discount' });
    } else {
      res.json({ message: 'Discount deleted successfully' });
    }
  });
});
// Fetch all transportations
app.get('/api/admin/transportations', authenticateAdmin, (req, res) => {
  const query = 'SELECT * FROM Transportation';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching transportations:", err);
      res.status(500).json({ error: 'Error fetching transportations', details: err.message });
    } else {
      res.json({ transportations: results });
    }
  });
});

// Add a new transportation
app.post('/api/admin/transportations', authenticateAdmin, (req, res) => {
  const { package_id, type, details, departure_time, arrival_time } = req.body;
  const query = 'INSERT INTO Transportation (package_id, type, details, departure_time, arrival_time) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [package_id, type, details, departure_time, arrival_time], (err, result) => {
    if (err) {
      console.error("Error adding transportation:", err);
      res.status(500).json({ error: 'Error adding transportation', details: err.message });
    } else {
      res.json({ transportation_id: result.insertId, message: 'Transportation added successfully' });
    }
  });
});

// Update a transportation
app.put('/api/admin/transportations/:id', authenticateAdmin, (req, res) => {
  const { package_id, type, details, departure_time, arrival_time } = req.body;
  const query = 'UPDATE Transportation SET package_id = ?, type = ?, details = ?, departure_time = ?, arrival_time = ? WHERE transportation_id = ?';
  db.query(query, [package_id, type, details, departure_time, arrival_time, req.params.id], (err, result) => {
    if (err) {
      console.error("Error updating transportation:", err);
      res.status(500).json({ error: 'Error updating transportation', details: err.message });
    } else {
      res.json({ message: 'Transportation updated successfully' });
    }
  });
});

// Delete a transportation
app.delete('/api/admin/transportations/:id', authenticateAdmin, (req, res) => {
  const query = 'DELETE FROM Transportation WHERE transportation_id = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) {
      console.error("Error deleting transportation:", err);
      res.status(500).json({ error: 'Error deleting transportation', details: err.message });
    } else {
      res.json({ message: 'Transportation deleted successfully' });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
