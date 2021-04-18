const nodemailer = require("nodemailer")

const transport = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth:{
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD
        // user:"makeup.art.customerservice@gmail.com",
        // pass:"shani1618"
    }
}
const transporter = nodemailer.createTransport(transport)

transporter.verify((error, success)=> {
    if(error)
        console.log(error)
    else
        console.log("ready to send mails")
})


module.exports = transporter

