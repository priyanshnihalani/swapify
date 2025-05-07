import express from "express"
import multer from 'multer';
import path from 'path';
import { ObjectId } from 'mongodb';


function patchRoutes(db, UPLOADS_DIR) {

    const router = express.Router();
    const app = express()

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, UPLOADS_DIR)
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        },
    })

    const upload = multer({ storage })

    app.use("/uploads", express.static(UPLOADS_DIR));

    router.patch('/teachSkill', async (request, response) => {

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

    router.patch('/learnSkill', async (request, response) => {

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

    router.patch('/deductCoin/:id', async (request, response) => {
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


    router.patch('/incrementCoin/:id', async (request, response) => {
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

    router.patch("/uploadCover/:id", upload.single("coverImage"), async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = path.join(__dirname, 'uploads', req.file.filename);

        // But store only the relative path in database for serving
        const dbPath = `/uploads/${req.file.filename}`;
        console.log(dbPath)
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

    router.patch('/updateProfile/:id', async (request, response) => {
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

    router.patch('/charges/:id', async (request, response) => {
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
    router.patch('/skillprovide/:id', async (request, response) => {
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

    router.patch('/skillwant/:id', async (request, response) => {
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

    router.patch('/rating', async (request, response) => {
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


    router.patch('/profileview/:id', async (request, response) => {
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

    return router;
}

export default patchRoutes