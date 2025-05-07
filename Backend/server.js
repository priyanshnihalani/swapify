import cors from 'cors';
import express from 'express';
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
import getRoutes from './getRoutes.js'
import patchRoutes from './patchRoutes.js'
import postRoutes from './postRoutes.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


env.config();
const jsonsecretkey = process.env.JWT_SECRET_KEY;
const url = process.env.MONGO_URI;
const app = express();


// Middlewares
app.use(cors({
    origin: "https://swapiify.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use(express.json());


app.use(bodyParser.json({ limit: '1gb' }));  // Increase the limit to 1GB for JSON payloads
app.use(bodyParser.urlencoded({ limit: '1gb', extended: true })); // Increase the limit to 1GB for URL-encoded payloads

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_DIR));

MongoClient.connect(url).then(client => {
    console.log("DataBase Connected");
    db = client.db('swapify');
    app.use('/', getRoutes(db));
    app.use('/', postRoutes(db, jsonsecretkey));
    app.use('/', patchRoutes(db, UPLOADS_DIR));
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


app.get('/auth/facebook/', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/register' }),
    (req, res) => {
        if (!req.user) {
            return res.redirect(`https://${process.env.FRONTEND_URL}/?error=AuthenticationFailed`);
        }

        const { accessToken, name, id } = req.user;

        res.redirect(`https://${process.env.FRONTEND_URL}/?id=${id}&token=${accessToken}&name=${encodeURIComponent(name)}`);
    }
);

const PORT = 3000;
server.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});