const nodemailer = require('nodemailer');

module.exports.send_mail = async (email, subject,template) => {
    var mailOptions = {
        from: process.env.SENDER_MAIL,
        to: email,
        subject: subject,
        html: template ,
    };

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'sandeep.infowind@gmail.com',
            pass: 'irtjifmqustewjrm'
        }
    });

    transporter.sendMail(mailOptions , (err , info)=>{
        if(err){
            return false;
        }else{
            return info;
        }
    })
}