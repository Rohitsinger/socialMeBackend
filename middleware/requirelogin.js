const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const mongoose= require('mongoose')
const User = mongoose.model("User")

module.exports =(req,res,next)=>{
   const {authorization} = req.headers
 
   if(!authorization){
   return res.status(401).json({error:"you must be logged in "})
   }

   jwt.verify(req.headers.authorization,JWT_SECRET,(err,payload)=>{
  
      if(err){
        return res.status(401).json({err:"you must be logged in"})
      }

      const {_id} = payload
      User.findById(_id).then(userdata=>{
        req.user = userdata
        next()
      })
     
  })



}


//authorization === Bearer efyrtrhffhfjfj
// module.exports =(req,res,next)=>{
//   const token = req.headers.authorization
// try {
//   if(token){
//    jwt.verify(token,JWT_SECRET,(err,decode)=>{
//     if(decode){
//     req.user._id = decode._id
//     next()
//     } else{
//       res.send("login please")
//     }
//   });
    
    
    
//   } 
// } catch (error) {
//   res.send(error)
// }
// }