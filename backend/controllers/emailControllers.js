import ParticipantModel from "../models/participant.models.js";

export const updateEmailStatus = async(req,res)=>{
    const {email,eventId} = req.body;
    try{

        const result = await ParticipantModel.updateOne(
            {email: email, event: eventId}, 
            {$set: {emailSent: true}}
        );
        
      
        
        if (result.matchedCount === 0) {
            console.warn(`No participant found with email ${email} in event ${eventId}`);
            return res.status(404).json({ error: 'Participant not found', details: {email, eventId} });
        }
        
        res.status(200).json({ 
            message: 'Email status updated successfully',
            modifiedCount: result.modifiedCount
        });
    }
    catch(err){
        console.error('Error updating email status:', err);
        res.status(500).json({ error: 'Failed to update email status', message: err.message });
    }
}