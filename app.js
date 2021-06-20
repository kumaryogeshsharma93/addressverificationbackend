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
//var http = require('http');
//var server = http.createServer(app);
var https = require('https');
var key = fs.readFileSync('./config/server.key');
var cert = fs.readFileSync('./config/server.crt');
var ca = fs.readFileSync('./config/ca.crt');
var options = {
  key: key.toString(),
  cert: cert.toString(),
  ca:ca.toString()
}

app.use(express.json());
app.use(cors({origin:"*"}))
// API calls start here..
app.use("/api/users",userRouter);
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
const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
async function sendMail(user) {
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
      subject: 'Verification Details submitted for '+ user.username + ' Client ' + user.clientname +' Ref Id '+ user.refId,
      text: 'Address Verification Details submitted for '+ user.username + ' for client ' + user.clientname +' and RefId '+ user.refId,
      html: '<h1>Hello ! '+ user.username +' has submit verfication details with Ref Id '+user.refId + ' for client '+user.clientname+'</h1>',
    };
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log('error   '+error);
    return error;
  }
}

// we can send blob from pdf file from angular application and
// save that file in node js server
app.post('/api/sendmail_fileupload', upload.any(), (req, res) => {
  var obj = {};
  var username =  req.body.username;
  var clientname = req.body.clientname;
  var refId = req.body.refId;
  obj.username = username;
  obj.clientname = clientname;
  obj.refId = refId;
  console.log(obj);

  sendMail(obj)
  .then((result) => {
    console.log('Email sent...', result)
    res.send(result);
  }
 )
.catch((error) => console.log('error '+error.message));


});

const memory_storage = multer.memoryStorage();
const multerImg = multer({ storage: memory_storage });
const multerConfig = {
   storage: multer.diskStorage({
     destination: function(req, file, next){
      next(null, '/tmp/');
    },
     filename: function(req, file, next){
      console.log(file);
      const ext = file.mimetype.split('/')[1];
      next(null, file.fieldname + '-' + Date.now() + '.'+ext);
    }
  }),

  // filter out and prevent non-image files.
  fileFilter: function(req, file, next){
        if(!file){
         // next();
        }
        next(null, true);
    }
};


app.get("/api", (req, res) => {
    res.json({
        success : 1,
        message : "This is first node API."
    });
});

app.get("/", (req, res) => {
    res.json({
        success : 1,
        message : "This is first node API."
    });
});

// we can un-comment below code if wants to run APIs of http

var http = require('http');
http.createServer(app,function (req, res) {
    console.log('http req caled !')
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(8080);

var httpsserver = https.createServer(options, app);
httpsserver.listen(8443, function () {
   console.log('Api server Started at port: '+8443);
}).setTimeout(0);

