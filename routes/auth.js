const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require ('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requireLogin = require('../middleware/requirelogin')


const User = mongoose.model("User");

const cloudinary = require('cloudinary').v2
cloudinary.config({ 
  cloud_name: 'dot0pk1dh', 
  api_key: '893126782658171', 
  api_secret: 'UAZ0z-mpcK5SR4EQvBH5kjxkSqQ',
  secure: true
});

router.get('/protected',requireLogin,(req,res)=>{
  res.send("Hello User")
})
router.get("/", requireLogin, (req, res) => {
  res.send("hello");
});

// router.get('/signup', (req,res)=>{
//   res.send({
//     name: 'Hello',
//     email: {},
//     password: {}
//   })
// })



router.post("/signup", async (req, res) => {
  

  const { name, email, password,about,worksAt,livesin } = req.body;
  const file = req.files.photo;
  cloudinary.uploader.upload(file.tempFilePath,(error,result)=>{
    console.log(result);
      if (!email || !password || !name || !about || !worksAt || !livesin) {
    return res.status(422).json({ error: "please enter all the fields" });
  }
  User.findOne({ email: email }).then((savesdUser) => {
    if (savesdUser) {
      return res
        .status(422)
        .json({ error: "user already exist with that email" });
    }

    bcrypt.hash(password, 12).then((hashedpassword) => {
      const user = new User({
        email,
        password:hashedpassword,
        name,
        about,
        worksAt,
        livesin,
        photo:result.url

      });
// console.log(user.photo);
      user.save()
        .then((user) => {
          res.status(201).json({ message: "saved successfully" });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
  })

});

router.post('/signin',(req,res)=>{
   const {email,password} = req.body
   if(!email || !password){
    return res.status(422).json({error:"please add email or pasword"})
   }
   User.findOne({email:email})
   .then(savedUser=>{
    if(!savedUser){
      return res.status(422).json({error:"Invalid email and password"})
    }
    bcrypt.compare(password,savedUser.password)
    .then(doMatch=>{
      if(doMatch){
       
        const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
          
          savedUser.password = undefined;
        res.json({token, user:savedUser})
      } else{
        return res.status(422).json({error:" Invalid email and password "})
      }
    }).catch(err=>{
      console.log(err);
    })
   })
})

module.exports = router;
