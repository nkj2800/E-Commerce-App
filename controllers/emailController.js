const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');


const sendEmail = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    }
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: process.env.AUTH_EMAIL, 
    to: data.to,
    subject: data.subject, 
    text: data.text, 
    html: data.html, 
  });

  console.log(`Message send to ${info.messageId}`);
  console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
});

module.exports = sendEmail;