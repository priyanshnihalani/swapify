import express from "express"
import { ObjectId } from 'mongodb';

function getRoutes(db){
    
    const router = express.Router();

    router.get('/searchData/:data', async (request, response) => {
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

    router.get('/userviewprofile/:id', async (request, response) => {

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
    
    
    router.get('/peopleviewprofile/:id', async (request, response) => {
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
    
    router.get('/retriveHost/', async (request, response) => {
        const id = request.query.userId;
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
    
    router.get('/block', async (request, response) => {
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
    
    router.get('/unblock', async (request, response) => {
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
    
    
    router.get('/fetchCharges/:id', async (request, response) => {
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
    
    router.get('/sendedChat', async (request, response) => {
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
    
    router.get('/messages/:id', async (request, response) => {
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
        
        if (messages.length === 0 ||  opponentIds.length === 0) {
            console.log("No opponents found.");
            response.send({message: "No Opponents found"})
            
        }
        else {
            const objectIds = opponentIds
            .filter(id => id != null)  // Filter out null and undefined values
            .map(id => id.toString())  // Ensure each id is a string
            .filter(id => ObjectId.isValid(id))  // Ensure the string is a valid ObjectId
            .map(id => new ObjectId(id)); 

            console.log("hi" + objectIds)

            const opponentsDetails = await db.collection("users").find({
                _id: { $in: objectIds }
            }).toArray();

            response.send(opponentsDetails)
        }
    })
    
    return router;
}

export default getRoutes;