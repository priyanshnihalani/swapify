import cors from 'cors';
import express, { Router } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { setupWebRTC } from './webrtc.js';
import { MongoClient, ObjectId } from 'mongodb';
import env from 'dotenv';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import session from 'express-session';
import bodyParser from 'body-parser';
import Chat from './chat.js';
import MongoStore from 'connect-mongo';
// Create an Express app
import getRoutes from './getRoutes.js'
import patchRoutes from './patchRoutes.js'
import postRoutes from './postRoutes.js'
const router = express.Router()

router.use(getRoutes);
router.use(postRoutes);
router.use(patchRoutes);

app.use(router);
app.use('/', router); 
env.config();

const url = process.env.MONGO_URI;

const app = express();

// Middlewares
app.use(cors({
    origin: "https://swapiify.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use(express.json());

app.use(bodyParser.json({ limit: '1gb' }));  // Increase limit to 50MB
app.use(bodyParser.urlencoded({ limit: '1gb', extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || "3af8cd0a920e4edc8bc8ebe19c867bd06bcf5e2912b19876d334ba029f2030db",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: url,
    })
}));


app.use(passport.initialize());
app.use(passport.session());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://swapiify.vercel.app",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});

let db;

MongoClient.connect(url).then(client => {
    console.log("DataBase Connected");
    db = client.db('swapify');
    Chat(io, db, ObjectId);

}).catch((error) => {
    console.log(error);
});


setupWebRTC(io);

passport.use(new FacebookStrategy(
    {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_REDIRECT_URI,
        profileFields: ['id', 'displayName', 'email']
    },
    async function (accessToken, refreshToken, profile, done) {
        try {
            const { id, displayName, emails } = profile;
            const email = emails?.[0]?.value || null; // Ensure it's not undefined
            const name = displayName || "Unknown User"; // Prevent null values

            if (!id) {
                return done(new Error("Facebook ID is missing"), null);
            }

            // Check if user exists using `facebookId` or `email`
            let user = await db.collection('users').findOne({
                $or: [{ facebookId: id }, { email: email }]
            });

            let userId;

            if (!user) {
                // Create new user only if necessary
                const result = await db.collection('users').insertOne({
                    name: name,
                    email: email,
                    facebookId: id,
                    coins: 400,
                    charges: 1
                });
                userId = result.insertedId;
            } else {
                userId = user._id;
            }

            // Generate JWT token
            const jwtToken = jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET_KEY, { expiresIn: '30d' });

            // Return user with token
            done(null, {
                accessToken: jwtToken,
                name: name,
                id: userId
            });

        } catch (error) {
            console.error("Error in Facebook authentication:", error);
            done(error, null);
        }
    }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Facebook authentication routes
app.get('/auth/facebook/', passport.authenticate('facebook')); // Redirect to Facebook
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/register' }),
    (req, res) => {
        if (!req.user) {
            return res.redirect('http://localhost:5173/?error=AuthenticationFailed');
        }

        const { accessToken, name, id } = req.user;

        // Redirect directly to home page with hash params
        res.redirect(`http://localhost:5173/?id=${id}&token=${accessToken}&name=${encodeURIComponent(name)}`);
    }
);

const PORT = 3000;
server.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});