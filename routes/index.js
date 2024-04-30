import express from "express";
const router = express.Router();
import nodemailer from 'nodemailer';


let codes = [ ]
let PrevCodes = [ ]

router.get("/", async (req, res) => {
  res.json({
    success: true,
    payload: PrevCodes})
});

router.post("/", async (req, res) => {
  let resp = await updateCode(req.body);
  res.json({
    success: true,
    payload: `${resp}`})
});

async function updateCode(body){
  let status = ""
  console.log(`Received: ${body.place}`)
  for(let [i, code] of codes.entries()){
    if(code[0] == body.id){
      if(code[3]){
        status = "Back Up"
        console.log(`'${body.place}' BACK UP`)
        send_email( "Program BACK UP",
        `The program ${body.place} is back up\n${JSON.stringify(body)}`)
      }else{
        status = "Updated"
      }
      codes[i][1] = "good";
      codes[i][3] = false
      if(code[2] != body.place){
        codes[i][2] = body.place;
      }
      break;
    }
  }
  if(status == ""){
    codes.push([body.id, "good", body.place, false])
    //send email, new received
    console.log(`'${body.place}' ADDED`)
    status = "Added"
    send_email( "Program ADDED",
    `The program ${body.place} has been added\n${JSON.stringify(body)}`)
  }
  return status
}

function checkCode(){
  //PrevCodes = [...codes];
  PrevCodes = cloneArray(codes)
  console.log("CHECKING: ", PrevCodes)
  for(let i=0; i<codes.length; i++){
    if(codes[i][1] == "bad" && !codes[i][3]){
      console.log(`'${codes[i][2]}' STOPPED`)
      send_email( "Program STOPPED",
      `The program ${codes[i][2]} has STOPPED!\n{id:${codes[i][0]}, status:bad, place:${codes[i][2]}}`)
      codes[i][3] = true
    }else{
      codes[i][1] = "bad";
    }
  }
}

async function send_email(subject, message) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    secure: false,
    auth: {
      user: process.env.email,
      pass: process.env.password
    },
    tls: {
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method' // You can try TLSv1_2_method or TLSv1_3_method
  }
  });

  const mailOptions = {
    from: process.env.emailFrom,
    to: process.env.emailDest,
    subject: subject,
    text: message
  };

  //console.log("About to send email to: ", process.env.emailDest, " From: ", process.env.email)
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
}

function cloneArray(arr) {
  const newGrid = [...arr]
  newGrid.forEach((row, rowIndex) => newGrid[rowIndex] = [...row])
  return newGrid
}

console.log("Server Started")
setInterval(checkCode, 1500000) // 10 mins

export default router;


/* Updates front end
for(let j=0; j<PrevCodes.length; j++){
    if(PrevCodes[j][0] == req.body.id){
      PrevCodes[j][1] = "good";
    }
  }
*/