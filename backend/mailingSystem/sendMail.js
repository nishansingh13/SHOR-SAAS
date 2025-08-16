import nodemailer from 'nodemailer';
import express from 'express';
const router = express.Router();
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "nishansingh2480@gmail.com",
        pass: "iedgvupemhpqjxvs"
    }
})
router.post('/',(req,res)=>{
    const {email, subject, content, attachments} = req.body;
    const mailOptions = {
        from: "nishansingh2480@gmail.com",
        to: email,
        subject: subject,
        text: content,
        attachments: attachments || []
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send("Email sent: " + info.response);
    });
})
export default router;