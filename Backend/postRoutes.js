import {express} from "express"
const router = express.Router();
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const jsonsecretkey = process.env.JWT_SECRET_KEY;


router.post('/updateRoom', async (request, response) => {
    const { userId, name, Ishost, roomId } = request.body;
    console.log({ userId, name, Ishost, roomId })
    console.log(request.body)
        try {

            await db.collection("room").insertOne({
                userId, name, roomId, Ishost
            })

            response.status(201).json({
                message: 'User Id Saved successfully'
            })

        }
        catch (error) {
            response.status(500).json({ message: 'Server error' });
        }
})


router.post('/register', async (request, response) => {
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


router.post('/login', async (request, response) => {
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

router.post('/send-email', async (request, response) => {
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



router.post('/forgotpassword', async (request, response) => {
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

        const resetUrl = `https://swapiify.vercel.app/reset-password/${resetToken}`;

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

router.post('/reset-password/:token', async (request, response) => {
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

router.post('/sendmessagedb', async (request, response) => {
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

module.exports = router;