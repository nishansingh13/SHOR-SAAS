import RequestFromAdmin from "../models/requestfromAdmin.models.js";

export const requestRegistrationFromAdmin= async(req,res)=>{
    const {email,password,GSTIN,name} = req.body;
    try{
        if(!email || !password || !GSTIN,!name){
            return res.status(400).json({error: "All fields are required"});
        }
        
        const newRequest = await RequestFromAdmin.create({
            email,
            password,
            GSTIN,
            name
        });
        await newRequest.save();
        res.status(201).json(newRequest);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}