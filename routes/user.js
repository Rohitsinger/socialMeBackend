const express = require("express");
const router = express.Router();

const Post = require("../models/post");
const User = require("../models/user");
const requirelogin = require("../middleware/requirelogin");


router.get('/user-auth',requirelogin,async(req,res)=>{
   return res.status(200).send({ok:true});
})

//all user
router.get('/alluser',requirelogin,async(req,res)=>{
  
    const allUser = await User.find({})
    res.status(200).json(allUser)
    
   
    
})
router.get('/singleUser/:id',async(req,res)=>{
    const _id = req.params.id
     await User.find({_id}).select("-password")
       .then((user)=>{
        Post.find({postedBy:req.params.id}).populate("postedBy","_id")
        .exec((err,post)=>{
          if(err){
            return res.status(422).json({error:err})
          }
          res.status(200).json({user,post})
        })
       }).catch(err=>console.log(err))
})

//to follow user

router.put('/follow/:id',requirelogin,async(req,res)=>{
   const {id} = req.params;
   const {_id} = req.body;
   if(_id===id){
    return res.status(403).json({message:"Action Forbidden"})
   } else{
    try {
      const followUser = await User.findById(id)
      const followingUser = await User.findById(_id)
      if(!followUser.followers.includes(_id)){
        await followUser.updateOne({  $push:{followers:_id}})
        await followingUser.updateOne({  $push:{following:id}})
        res.status(200).json("User Followed")
      }else{
        res.status(400).json("User is already followed by u")
      }
    } catch (error) {
       res.status(500).json(error)
    }
   }
  
})

//to follow user

router.put('/unfollow/:id',requirelogin,async(req,res)=>{
  const {id} = req.params;
  const {_id} = req.body;
  if(_id===id){
   return res.status(403).json({message:"Action Forbidden"})
  } else{
   try {
     const followUser = await User.findById(id)
     const followingUser = await User.findById(_id)
     if(!followUser.following.includes(_id)){
       await followUser.updateOne({  $pull:{followers:_id}})
       await followingUser.updateOne({  $pull:{following:id}})
       res.status(200).json("User Followed")
     }else{
       res.status(400).json("User is already followed by u")
     }
   } catch (error) {
      res.status(500).json(error)
   }
  }
 
})
  


module.exports = router