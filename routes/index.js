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
  for(let [i, code] of codes.entries()){
    if(code[0] == body.id && code[3]){
      codes[i][1] = "good";
      codes[i][3] = false
      status = "Back Up"
    }else if(code[0] == body.id){
      codes[i][1] = "good";
      codes[i][3] = false
      status = "Updated"
    }
    if(code[0] == body.id && code[2] != body.place){
      codes[i][2] = body.place;
    }
  }
  if(status == ""){
    codes.push([body.id, "good", body.place, false])
    //send email, new received
    console.log(`'${body.place}' ADDED`)
    status = "Added"
    send_email( "Program ADDED",
    `The program ${body.place} has been added\n${JSON.stringify(body)}`,
    "petershotbox@gmail.com")
  }else if(status == "Back Up"){
    console.log(`'${body.place}' BACK UP`)
    send_email( "Program BACK UP",
    `The program ${body.place} is back up\n${JSON.stringify(body)}`,
    "petershotbox@gmail.com")
  }
  return status
}

function checkCode(){
  console.log("CHECKING")
  PrevCodes = codes;
  //console.log(PrevCodes)
  for(let i=0; i<codes.length; i++){
    if(codes[i][1] == "bad" && !codes[i][3]){
      console.log(`'${codes[i][2]}' STOPPED`)
      send_email( "Program STOPPED",
      `The program ${codes[i][2]} has STOPPED!\n{id:${codes[i][0]}, status:bad, place:${codes[i][2]}}`,
      process.env.email)
      codes[i][3] = true
    }else{
      codes[i][1] = "bad";
    }
  }
}

async function send_email(subject, message, to_address) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.password
    }
  });

  const mailOptions = {
    from: process.env.email,
    to: to_address,
    subject: subject,
    text: message
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
}

console.log("Server Started")
setInterval(checkCode, 300000) // 5 mins

export default router;


/* Updates front end
for(let j=0; j<PrevCodes.length; j++){
    if(PrevCodes[j][0] == req.body.id){
      PrevCodes[j][1] = "good";
    }
  }
*/