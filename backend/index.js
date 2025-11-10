require('dotenv').config();
const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = admin.database();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
const apiRouter = express.Router();

apiRouter.get('/images', (req, res) => {
  db.ref('images').once('value')
    .then((snapshot) => {
      res.status(200).send(snapshot.val());
    })
    .catch((error) => {
      res.status(500).send({ message: 'Error fetching images', error });
    });
});

apiRouter.post('/images', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send({ message: 'URL is required' });
  }

  const newImageRef = db.ref('images').push();
  newImageRef.set({ url })
    .then(() => {
      res.status(201).send({ message: 'Image URL saved successfully' });
    })
    .catch((error) => {
      res.status(500).send({ message: 'Error saving image URL', error });
    });
});

apiRouter.post('/sessions', (req, res) => {
  const { sessionName, images } = req.body;
  if (!sessionName || !images || !images.home_screen || !images.game_over_screen || images.home_screen.length !== 3) {
    return res.status(400).send({ message: 'Session name, 3 home screen images, and 1 game over screen image are required' });
  }

  const newSessionRef = db.ref('sessions').push();
  const newSession = {
    sessionName,
    createdAt: new Date().toISOString(),
    images: {
      home_screen: images.home_screen.map(img => ({ ...img, clickCount: 0 })),
      game_over_screen: { ...images.game_over_screen, clickCount: 0 }
    },
  };

  newSessionRef.set(newSession)
    .then(() => {
      res.status(201).send({ message: 'Session saved successfully', sessionId: newSessionRef.key });
    })
    .catch((error) => {
      res.status(500).send({ message: 'Error saving session', error });
    });
});

apiRouter.get('/sessions', (req, res) => {
  db.ref('sessions').once('value')
    .then((snapshot) => {
      res.status(200).send(snapshot.val());
    })
    .catch((error) => {
      res.status(500).send({ message: 'Error fetching sessions', error });
    });
});

app.use('/api', apiRouter);

// Endpoint to serve Firebase config
app.get('/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});