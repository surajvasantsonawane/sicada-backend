import config from "config";
import jwt from 'jsonwebtoken';
const fs = require('fs');
import mailTemplet from "../helper/mailtemplet"
import cloudinary from 'cloudinary';
import nodemailer from 'nodemailer';
cloudinary.config({
  "cloud_name": config.get("cloudinary.cloud_name"),
  "api_key": config.get("cloudinary.api_key"),
  "api_secret": config.get("cloudinary.api_secret")
});
const crypto = require('crypto');

// import AWS from "aws-sdk";
// import ses from "node-ses";
// var SESserver = ses.createClient({
//   key: config.get("s3.key"),
//   secret: config.get("s3.secret")
// });
// const s3 = new AWS.S3({
//   accessKeyId: config.get("s3.key"),
//   secretAccessKey: config.get("s3.secret"),
//   // region: config.get("s3.region")
// });
module.exports = {

  
  getImageUrlPhase2: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files, { resource_type: "auto", transformation: { duration: 30 } })
    return result;
  },

  getOTP() {
    var otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  },

  generateResetToken() {
    const tokenLength = 40; // You can adjust the length as needed
    return crypto.randomBytes(tokenLength).toString('hex');
  },

  generateReferralCode() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  sendLink: async (to, link) => {
    let html = `<div style="font-size:15px">
                <p>Hello,</p>
                <p>Please click on the following invitation link "${link}">     
                </a>
                </p>
                  <p>
                      Thanks<br>
                  </p>
              </div>`

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')

      },

    });
    var mailOptions = {
      from: 'no-replymailer@mobiloitte.com',
      to: to,
      subject: 'Invitation Link',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  makeReferral() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },


  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get('jwtsecret'), { expiresIn: "24h" })
    return token;
  },


  sendMail: async (to, subject, body) => {
    const msg = {
      to: to, // Change to your recipient
      from: 'no-replymailer@mobiloitte.com', // Change to your verified sender
      subject: subject,
      text: body,
    }
    sgMail.send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
      })
      .catch((error) => {
        console.error(error)
      })
  },

  sendMailOtpNodeMailer: async (email, otp) => {
    let html = mailTemplet.signUpTemplet(otp)
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: config.get('nodemailer.email'),
      to: email,
      subject: "OTP VERIFICATION",
      html: html,

    };
    return await transporter.sendMail(mailOptions);
  },

  getImageUrl: async (files) => {
    console.log("files: ", files)
    await cloudinary.config({
      cloud_name: config.get("cloudinary.cloud_name"),
      api_key: config.get("cloudinary.api_key"),
      api_secret: config.get("cloudinary.api_secret"),
    });

    var result = await cloudinary.v2.uploader.upload(files, {
      resource_type: "auto"
    });
    return result;
  },

  getSecureUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files, { resource_type: "auto" })
    return result;
  },

  // getImageUrl: async (base64) => {
  //   var result = await cloudinary.v2.uploader.upload(base64, { resource_type: "auto" });
  //   return result.secure_url;
  // },

  getImageUrlUsingFile: async (filePath) => {
    try {
      console.log("File path: ", filePath);
      
      // Cloudinary configuration
      cloudinary.config({
        cloud_name: config.get("cloudinary.cloud_name"),
        api_key: config.get("cloudinary.api_key"),
        api_secret: config.get("cloudinary.api_secret"),
      });

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "auto", // Auto-detect file type (image, video, raw)
      });

      return result.url; // Return the URL of the uploaded file
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  },

  // getSecureUrl: async (image) => {
  //   let UploadedPresdPhoto = Date.now() + "-" + image.name;
  //   var filePathS3 = config.get('s3.bucket') + "/" + UploadedPresdPhoto;
  //   // let filePath = path.resolve(image.tempFilePath)
  //   let file = fs.readFileSync(image.tempFilePath)
  //   const params = {
  //     Bucket: config.get('s3.bucket'), // pass your bucket name
  //     Key: filePathS3,
  //     Body: file,
  //     ContentType: image.mimetype,
  //   };
  //   const s3UploadPromise = await new Promise(function (resolve, reject) {
  //     s3.upload(params, function (err, data) {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(data);
  //       }
  //     });
  //   });
  //   return s3UploadPromise.Location;
  // },


  newsLetterSendEmail: async (email) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      // bcc: ['no-aashutosh@mobiloitte.com'],
      subject: "Subscribe to Newsletter ",
      message: mailTemplet.subscribertemplet(
        email = email,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })
  },

  replyNewsLetterSendEmail: async (email, message) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      // bcc: ['no-aashutosh@mobiloitte.com'],
      subject: "Subscribe to Newsletter ",
      message: mailTemplet.replyNewsLetterTemplet(
        email = email,
        message = message
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })
  },


  sendMailOtpAWS: async (email, otp) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      // bcc: ['no-subhra@mobiloitte.com'],
      subject: "ACCOUNT VERIFICATION",
      message: mailTemplet.signUpTemplet(
        otp = otp,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })
  },

  sendMailKYCapprove: async (email, body) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      subject: "KYC STATUS",
      message: mailTemplet.mailKYCApproveTemplet(
        body = body,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })
  },

  sendMailKYCreject: async (email, body) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      subject: "KYC STATUS",
      message: mailTemplet.mailKYCRejectTemplet(
        body = body,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })

  },

  sendMailSendMoney: async (email, url) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      // bcc: ['no-subhra@mobiloitte.com'],
      subject: "PAYMENT VERIFY",
      message: mailTemplet.sendMoneyMailTemplet(
        url = url,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })
  },

  sendMailOtpForgetAndResendAWS: async (email, otp) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      // bcc: ['no-subhra@mobiloitte.com'],
      subject: "ACCOUNT VERIFICATION",
      message: mailTemplet.otpForgetResetTemplet(
        otp = otp,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log("....Error in 316", err);
      }
      return (data, 'email sent')
    })
  },

  sendMailStakeReject: async (email, body) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      // bcc: ['no-subhra@mobiloitte.com'],
      subject: "STAKE STATUS",
      message: mailTemplet.mailStackRejectTemplet(
        body = body,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })
  },

  sendMailStakeAccept: async (email, body) => {
    SESserver.sendEmail({
      to: email,
      from: aws_sender_email,
      cc: null,
      // bcc: ['no-subhra@mobiloitte.com'],
      subject: "STAKE STATUS",
      message: mailTemplet.mailStackAcceptTemplet(
        body = body,
      ),
      altText: 'plain text'
    }, function (err, data, res) {
      if (err) {
        console.log(err);
      }
      return (data, 'email sent')
    })
  },

  sendMailOtpNodeMailer: async (email, otp) => {
    let html = mailTemplet.signUpTemplet(otp)
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: config.get('nodemailer.email'),
      to: email,
      subject: "ACCOUNT VERIFICATION",
      html: html,

    };
    return await transporter.sendMail(mailOptions);
  },

  sendMailOtpForgotPasswordNodeMailer: async (email, otp, name = "") => {
    let html = mailTemplet.otpForgetResetTemplet(otp, name)
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: config.get('nodemailer.email'),
      to: email,
      subject: "Welcome to ChromeScan - Your OTP for Account Verification",
      html: html,

    };
    return await transporter.sendMail(mailOptions);
  },

  sendMailChangePasswordNodeMailer: async (email, name = "") => {
    let html = mailTemplet.changePasswordTemplate(name)
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: config.get('nodemailer.email'),
      to: email,
      subject: "Password Change Confirmation for Your ChromeScan Account",
      html: html,

    };
    return await transporter.sendMail(mailOptions);
  },

  sendPasswordResetLink: async (email, resetLink) => {
    let html = mailTemplet.passwordResetTemplate(resetLink);
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: config.get('nodemailer.email'),
      to: email,
      subject: "Password Reset",
      html: html,
    };
    return await transporter.sendMail(mailOptions);
  },

  sendMailSendMoneyNodeMailer: async (email, url) => {
    let html = mailTemplet.sendMoneyMailTemplet(url)
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: "ACCOUNT VERIFICATION",
      html: html,

    };
    return await transporter.sendMail(mailOptions)
  },

  sendMailNodeMailer: async (email, html, sub) => {


    // let transporter = nodemailer.createTransport({
    //   host: config.get("ses.endpoint"),
    //   port: config.get("ses.port"),
    //   secure: true, // true for 465, false for other ports
    //   auth: {
    //     user: config.get("ses.userName"),
    //     pass: config.get("ses.password")
    //   }
    // });
    // var mailOptions = {
    //   from: config.get("ses.email"),
    //   to: email,
    //   subject: sub,
    //   html: html
    // };
    // return await transporter.sendMail(mailOptions)



    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: sub,
      html: html,

    };
    return await transporter.sendMail(mailOptions);
  },

  sendEmailforAllUser: async (email, title, description) => {
    var html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title></title>
      
        <style type="text/css">
          table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
    @media only screen and (min-width: 670px) {
      .u-row {
        width: 650px !important;
      }
      .u-row .u-col {
        vertical-align: top;
      }
    
      .u-row .u-col-100 {
        width: 650px !important;
      }
    
    }
    
    @media (max-width: 670px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }
      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }
      .u-row {
        width: calc(100% - 40px) !important;
      }
      .u-col {
        width: 100% !important;
      }
      .u-col > div {
        margin: 0 auto;
      }
    }
    body {
      margin: 0;
      padding: 0;
    }
    
    table,
    tr,
    td {
      vertical-align: top;
      border-collapse: collapse;
    }
    
    p {
      margin: 0;
    }
    
    .ie-container table,
    .mso-container table {
      table-layout: fixed;
    }
    
    * {
      line-height: inherit;
    }
    
    a[x-apple-data-detectors='true'] {
      color: inherit !important;
      text-decoration: none !important;
    }
    
    </style>
      
      
    
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
    
    </head>
    
    <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">

      <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
      <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="width: 100% !important;">
      <div stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;" align="left">
            
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
          <img align="center" border="0" src="https://res.cloudinary.com/mobiloitte-technology-pvt-ltd/image/upload/v1693895118/Chromescan_PNG_j7izlq.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;" width="500"/>
          
        </td>
      </tr>
    </table>
    
          </td>
        </tr>
      </tbody>
    </table>
    
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
        <p style="line-height: 170%; text-align: center; font-size: 14px;"><span style="font-size: 24px; line-height: 40.8px; color: #000000;"><strong>${title}</strong></span></p>
    <p style="font-size: 14px; line-height: 170%; text-align: center;">
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    </div>
      </div>
    </div>
        </div>
      </div>
    </div>
    
    
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="width: 100% !important;">
      <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;"></br></br>

    <p style="font-size: 14px; line-height: 140%;">
    
    <br>
    <br>
    <p style="font-size: 14px; line-height: 140%;">
        <br>
            ${description}
        <br>
        <p style="font-size: 14px; line-height: 140%;">
    
    </div>
      
    
          </td>
        </tr>
      </tbody>
    </table>
    
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
            
    <div align="center">
        <a href= "" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
         
        </a>
    </div>
    
          </td>
        </tr>
      </tbody>
    </table></div>
      </div>
    </div>
        </div>
      </div>
    </div>
    
                                                 <!-- Social Icons -->
                                            <!-- <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">-->
                                            <!--    <tr>-->
                                            <!--        <td style="padding-right: 10px;">-->
                                            <!--            <a href="https://t.me/Olympustrade_announcement" target="_blank" title="Telegram"-->
                                            <!--                style="display: block;"><img src="https://res.cloudinary.com/mobiloitte-technology-pvt-ltd/image/upload/v1683367848/telegram_hjz5z4.png"-->
                                            <!--                    alt="Telegram" style="width: 30px; height: 30px;"></a>-->
                                            <!--        </td>-->

                                            <!--        <td style="padding-right: 10px;">-->
                                            <!--            <a href="https://www.youtube.com/@OlympusCryptoAIbot" target="_blank" title="Telegram"-->
                                            <!--                style="display: block;"><img src="https://res.cloudinary.com/mobiloitte-technology-pvt-ltd/image/upload/v1683367848/youtube_vp6jei.png"-->
                                            <!--                    alt="Telegram" style="width: 30px; height: 30px;"></a>-->
                                            <!--        </td>-->

                                            <!--        <td style="padding-right: 10px;">-->
                                            <!--            <a href="https://medium.com/@olympus_trade" target="_blank" title="Telegram"-->
                                            <!--                style="display: block;"><img src="https://res.cloudinary.com/mobiloitte-technology-pvt-ltd/image/upload/v1686747301/medium_n8xhmo.png"-->
                                            <!--                    alt="Telegram" style="width: 30px; height: 30px;"></a>-->
                                            <!--        </td>-->

                                            <!--        <td style="padding-right: 10px;">-->
                                            <!--            <a href="https://twitter.com/Olympus_AiTrade" target="_blank" title="Twitter"-->
                                            <!--                style="display: block;"><img src="https://res.cloudinary.com/mobiloitte-technology-pvt-ltd/image/upload/v1683367848/twitter_gzzjwd.png"-->
                                            <!--                    alt="Twitter" style="width: 30px; height: 30px;"></a>-->
                                            <!--        </td>-->
                                            <!--        <td>-->
                                            <!--            <a href="https://www.instagram.com/olympustrade_official/" target="_blank" title="Instagram"-->
                                            <!--                style="display: block;"><img-->
                                            <!--                    src="https://res.cloudinary.com/mobiloitte-technology-pvt-ltd/image/upload/v1683367849/instagram_qaaog8.png" alt="Instagram"-->
                                            <!--                    style="width: 30px; height: 30px;"></a>-->
                                            <!--        </td>-->
                                            <!--    </tr>-->
                                            <!--</table>-->
                                            <!--<br>-->
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;"></br>
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="width: 100% !important;">
          
     <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
      
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
        <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">2023 @ Chromescan| All Rights Reserved</span></p>
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    </div>
      </div>
    </div>
        </div>
      </div>
    </div>

        </td>
      </tr>
      </tbody>
      </table>
    
    </body>
    
    </html>`
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      }
    });
    var mailOptions = {
      from: config.get('nodemailer.email'),
      to: email,
      subject: 'New Notification from Liquidity Program',

      // text: sub,
      html: html
    };
    return await transporter.sendMail(mailOptions)
  }

}
