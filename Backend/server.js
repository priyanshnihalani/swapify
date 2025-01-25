import cors from 'cors';
import express, { response } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { setupWebRTC } from './webrtc.js';
import { MongoClient, ObjectId } from 'mongodb';
import env from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import session from 'express-session';
import bodyParser from 'body-parser';
// Create an Express app
const app = express();
env.config();

// Middlewares
app.use(cors());
app.use(express.json());

app.use(bodyParser.json({ limit: '1gb' }));  // Increase limit to 50MB
app.use(bodyParser.urlencoded({ limit: '1gb', extended: true }));

// Session Setup - Make sure it's before passport initialization
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Initialize passport after session middleware
app.use(passport.initialize());
app.use(passport.session());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const url = process.env.MONGO_URI;
const jsonsecretkey = process.env.JWT_SECRET_KEY;

let db;

MongoClient.connect(url).then(client => {
    console.log("DataBase Connected");
    db = client.db('swapify');
}).catch((error) => {
    console.log(error);
});

setupWebRTC(io);

app.get('/userviewprofile/:name', async (request, response) => {

    const user = decodeURIComponent(request.params.name);

    try {
        const record = await db.collection('users').findOne({ name: user })
        console.log(record)
        if (!record) {
            return response.status(404).send({ message: 'User not found' });
        }

        response.status(200).send(record)
    }
    catch (error) {
        console.log(error)
    }

})

app.post('/register', async (request, response) => {
    const { name, email, password } = request.body;

    try {
        const userExists = await db.collection('users').findOne({ email });
        if (userExists) {
            return response.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword
        });

        const accesstoken = jwt.sign({ id: result.insertedId }, jsonsecretkey, { expiresIn: '30d' });

        response.status(201).json({
            message: 'User registered successfully',
            accesstoken,
            name
        });

    } catch (error) {
        response.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (request, response) => {
    try {
        const { email, password } = request.body;
        const userExists = await db.collection('users').findOne({ email });
        if (!userExists) {
            return response.status(400).json({ message: 'Please Create Your Account' });
        }
        else {
            const isPasswordValid = await bcrypt.compare(password, userExists.password);
            if (!isPasswordValid) return response.status(400).json({ message: "Please Enter Correct Password" });

            const accesstoken = jwt.sign({ id: userExists.insertedId }, jsonsecretkey, { expiresIn: '30d' });

            response.status(200).json({
                message: "Welcome Back!",
                accesstoken,
                user: userExists
            });
        }
    }
    catch (error) {
        console.log(error);
    }
});


passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_REDIRECT_URI,
    profileFields: ['id', 'displayName', 'email']
}, async function (accessToken, refreshToken, profile, done) {
    try {
        const { id, displayName, emails } = profile;
        const email = emails && emails[0].value;
        const name = displayName || '';

        // Check if user exists
        let user = await db.collection('users').findOne({ name });
        let userId;

        if (!user) {
            // Create new user
            const result = await db.collection('users').insertOne({
                name: name,
                email: email,
                facebookId: id
            });
            userId = result.insertedId;
        }
        else {
            userId = user._id;
        }

        // Generate token first
        const jwtToken = jwt.sign({ id: userId }, jsonsecretkey, { expiresIn: '30d' });

        // Return user with token
        done(null, {
            accessToken: jwtToken,
            name: name
        });

    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Facebook authentication routes
app.get('/auth/facebook/', passport.authenticate('facebook')); // Redirect to Facebook
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/register' }),
    (req, res) => {
        const token = req.user.accessToken;
        const name = req.user.name;

        // Redirect directly to home page with hash params
        res.redirect(`http://localhost:5173/?token=${token}&name=${encodeURIComponent(name)}`);
    }
);

app.patch('/uploadCover/:id', async (request, response) => {
    console.log('Request body:', request.body);  // Log the request body to see what is being sent
    const id = new ObjectId(request.params.id);
    const { coverImage } = request.body;
    console.log('Content-Length:', request.headers['content-length']);

    if (!coverImage) {
        return response.status(400).send({ error: 'Image is required' });
    }

    try {
        const result = await db.collection('users').updateOne(
            { _id: id },
            { $set: { coverImage } }
        );

        if (result.matchedCount === 0) {
            return response.status(404).send({ error: 'Record not found' });
        }

        response.send({ message: 'Image updated successfully', modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error updating image:', error);
        response.status(500).send({ error: 'Error updating image' });
    }
});

app.patch('/updateProfile/:id', async (request, response) => {
    const id = new ObjectId(request.params.id);
    const { profileImage, name, description } = request.body;

    try {
        const result = await db.collection('users').updateOne(
            { _id: id },
            { $set: { profileImage, name, description } }
        )
        response.send({ message: 'Data Updated Successfully', modifiedCount: result.modifiedCount });
    }
    catch (error) {
        response.status(400).send({ message: error })
    }
})

app.patch('/skillprovide/:id', async (request, response) => {
    try {
        // Validate ObjectId
        const id = request.params.id;
        if (!ObjectId.isValid(id)) {
            return response.status(400).send({ message: 'Invalid ObjectId format' });
        }

        // Extract and validate skillprovide data
        const { skillprovide } = request.body;
        if (!Array.isArray(skillprovide)) {
            return response.status(400).send({ message: 'skillprovide must be an array' });
        }

        // Perform the database update
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) }, // Convert id to ObjectId
            { $set: { skillprovide } } // Update the skillprovide field
        );

        // Respond with success
        response.send({
            message: 'Data Updated Successfully',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error(error);
        response.status(500).send({ message: 'Internal Server Error' });
    }
});
// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
