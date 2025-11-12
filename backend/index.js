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

apiRouter.get('/player-analytics', async (req, res) => {
  try {
    const jungleJumperRef = db.ref('Jungle Jumper');
    const sandsOfCairoRef = db.ref('Sands of Cairo');

    const [jungleJumperSnapshot, sandsOfCairoSnapshot] = await Promise.all([
      jungleJumperRef.once('value'),
      sandsOfCairoRef.once('value'),
    ]);

    const allPlays = [];
    if (jungleJumperSnapshot.exists()) {
      jungleJumperSnapshot.forEach(child => {
        allPlays.push(child.val());
      });
    }
    if (sandsOfCairoSnapshot.exists()) {
      sandsOfCairoSnapshot.forEach(child => {
        allPlays.push(child.val());
      });
    }

    const totalPlays = allPlays.length;

    const uniquePlayers = {};
    allPlays.forEach(play => {
      if (!uniquePlayers[play.phoneNumber]) {
        uniquePlayers[play.phoneNumber] = { ...play, playCount: 0 };
      }
      uniquePlayers[play.phoneNumber].playCount += 1;
      if (play.playerScore > (uniquePlayers[play.phoneNumber].playerScore || 0)) {
        uniquePlayers[play.phoneNumber].playerScore = play.playerScore;
      }
    });

    const totalUniquePlayers = Object.keys(uniquePlayers).length;

    let returningPlayers = 0;
    let highestPlayCount = 0;
    Object.values(uniquePlayers).forEach(player => {
      if (player.playCount > 1) {
        returningPlayers += 1;
      }
      if (player.playCount > highestPlayCount) {
        highestPlayCount = player.playCount;
      }
    });

    const returnRate = totalUniquePlayers > 0 ? (returningPlayers / totalUniquePlayers) * 100 : 0;
    const averagePlays = totalUniquePlayers > 0 ? (totalPlays / totalUniquePlayers) : 0;

    // Data for Player Play Frequency Chart
    const playFrequency = { '1': 0, '2-3': 0, '4-5': 0, '6+': 0 };
    Object.values(uniquePlayers).forEach(player => {
      if (player.playCount === 1) playFrequency['1']++;
      else if (player.playCount >= 2 && player.playCount <= 3) playFrequency['2-3']++;
      else if (player.playCount >= 4 && player.playCount <= 5) playFrequency['4-5']++;
      else if (player.playCount >= 6) playFrequency['6+']++;
    });

    // Data for School-based charts
    const schoolData = {};
    Object.values(uniquePlayers).forEach(player => {
      const school = player.schoolName || 'Unknown';
      if (!schoolData[school]) {
        schoolData[school] = { uniquePlayers: 0, totalPlays: 0 };
      }
      schoolData[school].uniquePlayers++;
      schoolData[school].totalPlays += player.playCount;
    });

    res.status(200).send({
      totalPlays,
      totalUniquePlayers,
      returnRate: returnRate.toFixed(2),
      averagePlays: averagePlays.toFixed(2),
      highestPlayCount,
      players: Object.values(uniquePlayers),
      playFrequency,
      schoolData
    });

  } catch (error) {
    res.status(500).send({ message: 'Error fetching player analytics', error: error.message });
  }
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
