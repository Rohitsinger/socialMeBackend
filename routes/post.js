const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require('../middleware/requirelogin');
const { CommentedModel } = require("../models/post");
const Post = mongoose.model("Post")
const cloudinary = require('cloudinary').v2
cloudinary.config({ 
  cloud_name: 'dot0pk1dh', 
  api_key: '893126782658171', 
  api_secret: 'UAZ0z-mpcK5SR4EQvBH5kjxkSqQ',
  secure: true
});
router.get('/allpost',(req,res)=>{
   Post.find({})
   .populate("postedBy","_id name email photo")
   .populate("comments.postedBy","_id name photo").sort({createdAt:-1})
   .then(posts=>{
      res.json({posts})
   })
   .catch(err=>{
      console.log(err);
   })
})

router.post('/createpost',requireLogin,(req,res)=>{
   const {title,body} = req.body
   const file = req.files.photo;
   cloudinary.uploader.upload(file.tempFilePath,(error,result)=>{
     console.log(result);
   
   if(!title || !body ){
    return res.status(422).json({err:"Please add all the fields"})
   }
    const post = new Post({
    title,
    body,
    photo:result.url,
    postedBy:req.user
   })
  
   post.save().then(result=>{
    res.status(201).send({
      success:true,
      post:result})
   })
   .catch(err=>{
    console.log(err);
   })
})
})

router.get('/mypost',requireLogin,(req,res)=>{
  Post.find({postedBy:req.user._id})
  .populate("postedBy","_id name email")
  
  .then(mypost=>{
   res.json({mypost})
  })
  .catch(err=>{
   console.log(err);
  })
})

router.patch('/like/:id',requireLogin,async(req,res)=>{
  const post = await Post.findById(req.params.id)
   if(!post){
      return res.status(400).json({
         success:false,
         message:"Post not found"
      });
   }
   if(post.likes.includes(req.user._id)){
      const index = post.likes.indexOf(req.user._id)
         post.likes.splice(index,1)
      await post.save();
      return res.status(200).json({
         success:true,
         message:"Post unliked",
      
      });
   } else{
      post.likes.push(req.user._id)
      await post.save()
      return res.status(200).json({
         success:true,
         message:"Post Liked"
      });
   }
}
)


router.put('/comment',requireLogin, (req,res)=>{
   const comment = {
      text:req.body.text,
      postedBy:req.user._id
   }
   console.log(comment);
   Post.findByIdAndUpdate(req.body.postId,{
     
      $push:{comments:comment}

   },{
      new:true
   })
   .populate("postedBy","_id name photo")
   
   .exec((err,result)=>{
      if(err){
         return res.status(422).json({error:err})
      }
      else{
         res.json(result)
      }
      
   })
})
router.get('/get-comments', requireLogin,async(req,res)=>{

const comments =  await Post.find().populate("comments.postedBy","_id name photo").sort("-createdAt")

.then((postComments)=>{res.json({postComments})}).catch(err=>console.log(err))
 
})
router.delete('/delete-comments/:id', requireLogin,async(req,res)=>{
   try{
     const post = await Post.findById(req.params.id)
   
    if(!post){
      return res.status(400).json({
         success:false,
         message:"Post not found"
      });
   }

if(post.postedBy._id.toString()===req.user._id.toString()){
    await post.comments.forEach((item,index)=> {
         if(item._id.toString()===req.body.commentId.toString()){
           return post.comments.splice(index,1)
         }
       });
    await post.save()
    return res.status(200).send({message:"Selected Comment Deleted",success:"true"})
      }   else{
         await post.comments.forEach((item,index)=> {
            if(item.postedBy.toString()===req.user._id.toString()){
              return post.comments.splice(index,1)
            }
          });
      }
   await post.save()
  return res.status(200).send({message:"Deleted Post",success:"true"})
} catch (error) {
   console.log(error);
}
    
   }
   )
router.patch('/edit-post/:id',requireLogin, async(req,res)=>{
   const {body,title} = req.body
   const file= req.files.photo
   const _id =  req.params.id
  try {
 
 const updated = await Post.findByIdAndUpdate(_id,{...req.body,file},{new:true})
 res.status(200).send({message:"Updated Successfully",success:true,updated})   
  
  } catch (error) {
    console.log(error);
    res.status(500).send({message:"Couldnot Update ",success:false}) 
  }
  
   })

router.delete('/delete-post/:id',requireLogin, async(req,res)=>{

   const _id =  req.params.id
  try {
 
 const deleted = await Post.findByIdAndDelete(_id)
 res.status(200).send({message:"Deleted Successfully",success:true,deleted})   
  
  } catch (error) {
    console.log(error);
    res.status(500).send({message:"Couldnot Delete ",success:false}) 
  }
  
   })

module.exports = router