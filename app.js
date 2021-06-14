require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser')
const fs = require('fs');
const multer  = require('multer')
const fileType = require('file-type');
const path = require('path');
const nodemailer = require('nodemailer');
const readline = require('readline');
const {google} = require('googleapis');

const userRouter = require('./api/users/user.router');
const { getMaxListeners } = require("process");
const app = express();
app.use(express.json());
app.use(cors({origin:"*"}))
var dir = '/tmp/';
var upload =  multer();
fs.mkdir(dir, function(err) {
  if (err) {
    console.log(err)
  } else {
    console.log("New directory successfully created.")
  }
});

// mail sending code

// These id's and secrets should come from .env file.
const CLIENT_ID = '131415255513-8hhp625d747ng0pl6a31sseqtlt9r5is.apps.googleusercontent.com';
const CLEINT_SECRET = 't1eMqZHT6eB9petrYutzu2D1';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04mbId7jYcFu4CgYIARAAGAQSNwF-L9IrHzW_lGGEcKvaTMyUeFH6-pWSGfVun21CWdFiDYHGYRDpluASiHOaNu9HJhbDR3OmW_s';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'iiservzncr@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    const mailOptions = {
      from: 'IISERVZ <iiservzncr@gmail.com>',
      to: 'yogesh121210@gmail.com',
      subject: 'Hello from gmail using API',
      text: 'Hello from gmail email using API',
      html: '<h1>Hello from gmail email using API</h1>',
    };
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log('error   '+error);
    return error;
  }
}
// mail sending code ends here

app.post("/sendUserEmail" , (req,res) => {
  let user = req.body;
  console.log(user);
  sendMail()
  .then((result) => {
    console.log('Email sent...', result)
    res.send(result);
  }
    )
  .catch((error) => console.log('error '+error.message));
});



app.post("/sendEmail" , (req,res) => {
  let user = req.body;
  console.log(user);
  sendMailDirect(user, info => {
    console.log(`The mail has beed send 😃 and the id is ${info.messageId}`);
    res.send(info);
  });
});

async function sendMailDirect(user, callback) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'GMAIL_USER',
      pass: 'GMAIL_PWD'
    }
  });

  let mailOptions = {
    from: '"Email Send from Node Js APP !', // sender address
    to: 'yogesh121210@gmail.com', // list of receivers
    subject: "Wellcome to IISERVZ 👻", // Subject line
    html: `<h1>Hi Yogesh </h1><br>
    <h4>Thanks for joining us</h4>`
  };
  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);
  callback(info);
}


const memory_storage = multer.memoryStorage();
const multerImg = multer({ storage: memory_storage });
// const storage = multer.memoryStorage({
//     destination: function(req, file, callback) {
//         callback(null, '')
//     }
// });
const multerConfig = {
  //specify diskStorage (another option is memory)
  storage: multer.diskStorage({
    //specify destination
    destination: function(req, file, next){
      next(null, '/tmp/upload');
    },
    //specify the filename to be unique
    filename: function(req, file, next){
      console.log(file);
      const ext = file.mimetype.split('/')[1];
      //set the file fieldname to a unique name containing the original name, current datetime and the extension.
      next(null, file.fieldname + '-' + Date.now() + '.'+ext);
    }
  }),

  // filter out and prevent non-image files.
  fileFilter: function(req, file, next){
        if(!file){
         // next();
        }
        next(null, true);
      
      /*
     // only permit zip mimetypes , 
     // we can restrict to any file type
      const zip = file.mimetype.startsWith('application');
      if(zip){
        console.log('zip uploaded');
        next(null, true);
      }else{
        console.log("file not supported")
        errorReq = true;
        return next();
      }
      */
  }
};
// API calls start here..
app.use("/api/users",userRouter);
app.get("/api", (req, res) => {
    res.json({
        success : 1,
        message : "This is first node API."
    });
});

// upload single file and any file type in node application
 app.post('/api/any-file-upload', multer(multerConfig).single('file'), (req, res) => {
    console.log('File created !');
    res.status(200).send('ok');
 });

app.post('/api/file-upload2', upload.any(), (req, res) => {
  console.log('Files: ', req.files);
  fs.writeFile(req.files[0].originalname, req.files[0].buffer, (err) => {
    if (err) {
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    } else {
        console.log('File created !');
        res.status(200).send('ok');
    }
});
});


// we can send image dataurl from angular application and
// save that file in node js server
app.post('/api/file-image-upload', multerImg.single('userpdf'), (req, res) => {
  var imageBuffer = decodeBase64Image(req.body.userpdf);
  console.log(imageBuffer);
  fs.writeFile('sample.jpg', imageBuffer.data, (err) => {
    if (err) {
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    } else {
        console.log('File created !');
        res.status(200).send('ok');
    }
});
});

// we can send blob from pdf file from angular application and
// save that file in node js server
app.post('/api/file-upload', upload.any(), (req, res) => {
  console.log('Files: ', req.files);
  var fileWithPath = dir+req.files[0].originalname + '.pdf';
  console.log(fileWithPath);
  var fileWithPath2 = dir+"upload"+req.files[0].originalname + '.pdf';
  fs.writeFile( fileWithPath2 , req.files[0].buffer, (err) => {
    if (err) {
        console.log('Error: ', err);
        res.status(500).send('An error occurred: ' + err.message);
    } else {
        console.log('File created !');
        res.status(200).send('ok');
        //
        /*
        fs.unlink(fileWithPath2 , (err) => {
          if (err) {
              console.log("failed to delete local image:"+err);
          } else {
              console.log('successfully deleted local image');                                
          }
            });
        */
        //
        fs.unlink(dir , (err) => {
          if (err) {
              console.log("failed to delete local image:"+err);
          } else {
              console.log('successfully deleted local image');                                
          }
            });
    }
});
});

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }
  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  return response;
}

app.listen(process.env.APP_PORT, () => {
    console.log('Server is running !');
});