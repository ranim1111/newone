const userModel = require("../models/user.model");
const nodemailer = require("nodemailer");

function mailService(email, firstName) {
  transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: "lamianouri55@outlook.com",
      pass: "ranim123",
    },
  });

  var mailOptions = {
    from: "lamianouri55@outlook.com", // sender address (who sends)
    to: email, // list of receivers (who receives)
    subject: "Account Activation Link ", // Subject line

    html: `
    Hello - Please click here ! </br>
    
   </br>
  
   </br>
   </br>
   </br>
   </br>
   E-mail : info@branper.com
   </br>
   PhoneNumber: +216 56 219 219
   </br>
   Site web:  www.branper.com
   </br>
   Location : Novation city, H. Maarouf, Riadh `, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }

    console.log("Message sent: " + info.response);
  });
}
module.exports = mailService;
