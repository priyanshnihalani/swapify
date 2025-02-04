import cors from 'cors';
import express from 'express';
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
import Chat from './chat.js';
import nodemailer from 'nodemailer'
import crypto from 'crypto'
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
    Chat(io, db, ObjectId);

}).catch((error) => {
    console.log(error);
});


setupWebRTC(io);

app.get('/searchData/:data', async (request, response) => {
    const data = request.params.data;
    const record = await db.collection('users').find(
        {
            $or: [
                { description: { $regex: data, $options: 'i' } },
                { skillprovide: { $regex: data, $options: 'i' } }
            ]
        }
    ).toArray()
    try {


        if (!record) {
            return response.status(404).send({ message: 'No Data Found' });
        }
        response.status(200).send(record);
    }
    catch (error) {
        console.log(error)
    }
})

app.get('/userviewprofile/:id', async (request, response) => {

    const id = new ObjectId(request.params.id);

    try {
        const record = await db.collection('users').findOne({ _id: id })
        if (!record) {
            return response.status(404).send({ message: 'User not found' });
        }

        response.status(200).send(record)
    }
    catch (error) {
        console.log(error)
    }

})


app.get('/peopleviewprofile/:id', async (request, response) => {
    const id = new ObjectId(request.params.id);
    try {
        const record = await db.collection('users').findOne({ _id: id });

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

app.post('/send-email', async (request, response) => {
    const { email, subject, message } = request.body;

    try {

        const insert = await db.collection('contactMessages').insertOne({
            email, subject, message
        })

        if (insert.modifiedCount != 0) {
            return response.status(200).send({ message: "Success to Send Message" })
        }
        else {
            throw Error;
        }
    }
    catch (error) {
        console.log(error)
        return response.status(500).send({ message: "Failed to Send Message" })
    }
})

app.get('/block', async (request, response) => {
    const { idToBlock, idWantToBlock } = request.query;

    let blockArray = [];
    blockArray.push(idToBlock);

    try {

        await db.collection('users').updateOne(
            { _id: new ObjectId(idWantToBlock) },
            { $set: { BlockUsers: blockArray } }
        )

        return response.status(200).send({ message: "Success to Block User" })

    }
    catch (error) {
        return response.status(500).send({ message: "Failed to Block User Message" })
    }


})

app.get('/unblock', async (request, response) => {
    const { idToUnBlock, idWantToUnBlock } = request.query;


    try {

        await db.collection('users').updateOne(
            { _id: new ObjectId(idWantToUnBlock) },
            { $pull: { BlockUsers: idToUnBlock } }
        )

        return response.status(200).send({ message: "Success to UnBlock User" })

    }
    catch (error) {
        return response.status(500).send({ message: "Failed to UnBlock User Message" })
    }


})

app.post('/forgotpassword', async (request, response) => {
    const { email } = request.body;

    try {
        let record = await db.collection('users').findOne({ email });

        if (!record) {
            return response.status(400).send({ message: "Email Not Found" })
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

        await db.collection('users').updateOne({ email }, { $set: { resetToken, resetTokenExpiry } })



        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAILER_USER,
                pass: process.env.MAILER_PASSWORD
            }
        })

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.MAILER_USER,
            to: email,
            subject: 'Password Reset',
            text: `To reset your password, click the following link: ${resetUrl}`,
        };

        console.log(process.env.MAILER_USER, process.env.MAILER_PASSWORD)

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).send({ message: 'Error sending email' });
            }
            response.status(200).send({ message: 'Password reset link sent in email' });
        });
    }
    catch (error) {
        return response.status(500).send('Internal Server Error');
    }

})

app.post('/reset-password/:token', async (request, response) => {
    const token = request.params?.token;
    const password = request.body?.password

    try {
        const record = await db.collection('users').findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        })

        if (!record) {
            return response.status(400).send({ message: 'Invalid or expired token' });
        }

        const encryptedPassword = await bcrypt.hash(password, 10)
        await db.collection('users').updateOne(

            { resetToken: token }, { $set: { password: encryptedPassword, resetToken: undefined, resetTokenExpiry: undefined } }
        )

        response.status(200).send({ message: 'Password successfully reset' });
    }
    catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
})

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
    const id = new ObjectId(request.params.id);
    const { coverImage } = request.body;


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

app.patch('/skillwant/:id', async (request, response) => {
    const { id } = request.params;
    const { skillwant } = request.body;


    if (!skillwant || !Array.isArray(skillwant)) {
        return response.status(400).send({ error: 'Invalid or missing skillwant data' });
    }

    try {

        const updatedData = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: { skillwant } },
        );

        if (!updatedData) {
            return response.status(404).send({ error: 'Data not found' });
        }

        response.send(updatedData);
    } catch (err) {
        console.error('Error updating data:', err);
        response.status(500).send({ error: 'Internal Server Error' });
    }
});


app.post('/sendmessagedb', async (request, response) => {
    const { sender, receiver, message, timestamp } = request.body;

    const result = await db.collection('sendMessage').insertOne({
        sender,
        receiver,
        message,
        timestamp
    })

    if (result?.modifiedCount == 0) {
        return response.status(500).send({ message: 'Something Went Wrong!' })
    }
    response.status(200).send({ message: "Record Inserted" })
})


app.get('/sendedChat', async (request, response) => {
    const { from, to } = request.query;

    const result = await db.collection('sendMessage').find({
        sender: from,
        receiver: to
    }).toArray()

    if (result.matchedCount == 0) {
        return res.status(404).send({ error: 'Data not found' });
    }
    response.send(result);
})

app.get('/messages/:id', async (request, response) => {
    const id = request.params.id;

    const messages = await db.collection('sendMessage').find({
        $or: [{ sender: id }, { receiver: id }]
    }).toArray()

    const opponent = new Set();
    messages.forEach(element => {
        if (element.receiver === id) {
            opponent.add(element.sender)
        }
        else {
            opponent.add(element.receiver)
        }
    });


    const opponentIds = [...opponent];


    if (opponentIds.length === 0) {
        console.log("No opponents found.");
    }
    else {
        const objectIds = opponentIds.map(id => new ObjectId(id));

        const opponentsDetails = await db.collection("users").find({
            _id: { $in: objectIds }
        }).toArray();

        response.send(opponentsDetails)
    }
})

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
