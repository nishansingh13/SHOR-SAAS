import ParticipantModel from "../models/participant.models.js";

export const updateEmailStatus = async(req,res)=>{
    const {email,eventId} = req.body;
    try{
        await ParticipantModel.updateOne({email,event:eventId}, {emailSent: true});
        res.status(200).json({ message: 'Email status updated successfully' });
    }
    catch(err){
        console.error('Error updating email status:', err);
        res.status(500).json({ error: 'Failed to update email status' });
    }
}