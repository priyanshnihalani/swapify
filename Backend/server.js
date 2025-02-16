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
import Chat from './chat.js';
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import MongoStore from 'connect-mongo';
// Create an Express app

env.config();

const url = process.env.MONGO_URI;
const jsonsecretkey = process.env.JWT_SECRET_KEY;

const app = express();

// Middlewares
app.use(cors({
    origin: "https://swapiifyfrontend.vercel.app",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));

app.use(express.json());

app.use(bodyParser.json({ limit: '1gb' }));  // Increase limit to 50MB
app.use(bodyParser.urlencoded({ limit: '1gb', extended: true }));

// Session Setup - Make sure it's before passport initialization
app.use(session({
    secret: process.env.SESSION_SECRET || "3af8cd0a920e4edc8bc8ebe19c867bd06bcf5e2912b19876d334ba029f2030db",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: url,
    })
}));

// Initialize passport after session middleware
app.use(passport.initialize());
app.use(passport.session());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://swapiifyfrontend.vercel.app",
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/'))
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
})

const upload = multer({ storage })

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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


        if (record.length == 0) {
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

app.post('/updateRoom', async (request, response) => {
    const { userId, name, Ishost, roomId } = request.body;
    console.log({ userId, name, Ishost, roomId })
    console.log(request.body)
    // try {

    //     await db.collection("room").insertOne({
    //         userId, name, roomId, Ishost
    //     })

    //     response.status(201).json({
    //         message: 'User Id Saved successfully'
    //     })

    // }
    // catch (error) {
    //     response.status(500).json({ message: 'Server error' });
    // }
})

app.get('/retriveHost/', async (request, response) => {
    const id = new ObjectId(request.query.userId);
    const roomid = request.query.roomId;
    try {
        const record = await db.collection("room").findOne({
            roomId: roomid,
            userId: id
        })

        if (record) {
            return response.status(200).send({record})
        }

        return response.status(400).send({ message: "Record Not Found" })

    }
    catch (error) {
        console.log(error)
        return response.status(500).send({ message: "Internal Server Error" })
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
            password: hashedPassword,
            coins: 400,
            charges: 1
        });

        const accesstoken = jwt.sign({ id: result.insertedId.toString() }, jsonsecretkey, { expiresIn: '30d' });

        response.status(201).json({
            message: 'User registered successfully',
            accesstoken,
            name,
            id: result.insertedId.toString()
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

            const accesstoken = jwt.sign({ id: userExists._id }, jsonsecretkey, { expiresIn: '30d' });

            response.status(200).json({
                message: "Welcome Back!",
                accesstoken,
                name: userExists.name,
                id: userExists._id.toString()
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
        response.status(500).send({ message: 'Server error' });
    }
})


app.patch('/rating', async (request, response) => {
    const data = request.body;
    const timeStamp = Date.now()
    const id = new ObjectId(data.hostId)
    try {

        const record = await db.collection('users').updateOne(
            { "_id": id },
            {
                $push: {
                    reviews: {
                        timestamp: timeStamp,
                        from: data.client,
                        stars: data.starValue,
                        textValue: data.textValue
                    }
                }
            }
        )

        if (record && record.modifiedCount > 0) {
            return response.status(200).send({ message: 'Review Sent Successfully' });
        }
        response.status(400).send({ message: 'User Not Found' });
    }
    catch (error) {
        response.status(500).send({ message: 'Failed to Sent Review' });
    }
})


app.patch('/profileview/:id', async (request, response) => {
    const id = request.params.id;
    console.log("view id: " + id);
    const data = request.body
    try {
        const prevrecord = await db.collection('users').findOne(
            { "_id": new ObjectId(id) },
            { projection: { views: 1 } }
        )

        const alreadyViewed = prevrecord.views?.some(item => item.id === data.id);

        if (alreadyViewed) {
            return response.status(200).send({ message: 'View Already Exists' });
        }


        const record = await db.collection('users').updateOne(
            { "_id": new ObjectId(id) },
            {
                $addToSet: {
                    views: {
                        timeStamp: data.timeStamp,
                        id: data.id
                    }
                }
            }
        )
        if (record && record.modifiedCount > 0) {
            return response.status(200).send({ message: 'View Added' });
        }
        response.status(400).send({ message: 'User Not Found' });
    }
    catch (error) {
        return response.status(500).send({ message: 'Failed To Add View' });
    }
})

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


app.patch("/uploadCover/:id", upload.single("coverImage"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    // But store only the relative path in database for serving
    const dbPath = `/uploads/${req.file.filename}`;
    const userId = req.params.id;

    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const result = await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            { $set: { coverImage: dbPath } }  // Store the relative path
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "File uploaded successfully",
            filePath: dbPath  // Send the relative path to frontend
        });

    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
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

app.patch('/charges/:id', async (request, response) => {
    try {
        const id = request.params.id.toString();
        const { rate } = request.body
        console.log(request.body)

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: { charges: rate } }
        );

        response.send({
            message: 'Data Updated Successfully',
            modifiedCount: result.modifiedCount,
        });
    }
    catch (error) {
        console.error(error);
        response.status(500).send({ message: 'Internal Server Error' });
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



app.patch('/deductCoin/:id', async (request, response) => {
    const { coins } = request.body;

    try {

        if (!coins || isNaN(coins) || coins <= 0) {
            return response.status(400).send({ error: "Invalid coin amount" });
        }


        const user = await db.collection('users').findOne(
            { "_id": new ObjectId(request.params.id) },
            { projection: { coins: 1 } }
        );

        if (!user) {
            return response.status(404).send({ error: "User not found" });
        }

        if (user.coins === undefined || user.coins <= 0) {
            console.log("Something went wrong")
            return response.status(400).send({ message: "User has zero or negative coins, cannot deduct." });
        }

        if (user.coins < coins) {
            return response.status(400).send({ message: "Insufficient coins to deduct." });
        }


        const result = await db.collection('users').updateOne(
            { "_id": new ObjectId(request.params.id), "coins": { $gte: coins } },
            { $inc: { coins: -coins } }
        );

        if (result.modifiedCount > 0) {
            return response.status(200).send({ message: "Coins deducted successfully" });
        }

        return response.status(400).send({ message: "Failed to deduct coins" });

    } catch (error) {
        console.error("Error deducting coins:", error);
        response.status(500).send({ message: "Internal Server Error" });
    }
});


app.patch('/incrementCoin/:id', async (request, response) => {
    const id = new ObjectId(request.params.id)
    const { coins } = request.body;
    const record = await db.collection('users').updateOne(
        { "_id": id },
        { $inc: { coins: +coins } }
    )

    if (record.modifiedCount > 0) {
        return response.status(200).send({ message: "Coins Incremented successfully" });
    }

    return response.status(400).send({ message: "Failed to increment coins" });
})

app.get('/fetchCharges/:id', async (request, response) => {
    const id = new ObjectId(request.params.id);

    try {

        const record = await db.collection('users').findOne(
            { "_id": id },
            { projection: { charges: 1 } }
        );

        if (record) {
            return response.status(200).send(record);
        }

        return response.status(400).send({ message: "User Not Found" });
    }
    catch (error) {
        console.error("Error in Getting Record", error);
        response.status(500).send({ message: "Internal Server Error" });
    }
})

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

app.patch('/teachSkill', async (request, response) => {

    const { teacher, learner } = request.query

    console.log(teacher, learner)
    const timeStamp = Date.now()
    try {

        const record = await db.collection('users').updateOne(
            { "_id": new ObjectId(teacher) }, {
            $push: {
                teaches: {
                    learner,
                    timeStamp
                }
            }
        }
        )
        if (record && record.modifiedCount > 0) {
            return response.status(200).send({ message: 'Teaching Added' });
        }
        response.status(400).send({ message: 'User Not Found' });
    }
    catch (error) {
        return response.status(500).send({ message: 'Failed To Add Teaching' });
    }
})

app.patch('/learnSkill', async (request, response) => {

    const { teacher } = request.query
    const { learner } = request.query

    console.log(teacher, learner)
    const timeStamp = Date.now()
    try {

        const record = await db.collection('users').updateOne(
            { "_id": new ObjectId(learner) }, {
            $push: {
                learnes: {
                    teacher,
                    timeStamp
                }
            }
        }
        )
        if (record && record.modifiedCount > 0) {
            return response.status(200).send({ message: 'Learning Added' });
        }
        response.status(400).send({ message: 'User Not Found' });
    }
    catch (error) {
        return response.status(500).send({ message: 'Failed To Add Learning' });
    }
})

const PORT = 3000;
server.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
