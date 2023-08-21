const express = require('express');
const User = require('../models/user');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middleware/verifyToken');
const validateObjectId = require('../middleware/validateObjectId');


// register
router.post('/register' , async(req,res)=>{
    try {
        const user = new User({
            name: req?.body.name,
            email: req?.body.email,
            passwordHash: bcrypt.hashSync(req?.body.password ,10) ,
            phone: req?.body.phone,
            isAdmin: req?.body.isAdmin,
            street: req?.body.street,
            apartment: req?.body.apartment,
            zip: req?.body.zip,
            city: req?.body.city,
            country: req?.body.country,

        })
        if (!user) {
            return res.status(400).json({message: " Error in your registration"})
        }
        await user.save();

        res.status(200).json({
            success : true ,
            message: " your are registered successfully",
            data : user
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in your registration",
        })
    }
})


// get all users 
router.get('/',verifyTokenAndAdmin, async(req,res)=>{
    try {
        const user = await User.find({}).select("-passwordHash")
        if (!user) {
            return res.status(500).json({message: " there are no users"})
        }
        res.status(200).json({
            success : true ,
            message: "Users List",
            data : user
        })

    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get all users",
        })
    }
})


// get single user
router.get('/:id',validateObjectId,verifyTokenAndAuthorization, async(req,res)=>{
    try {
        const user = await User.findById(req.params.id).select('-passwordHash')
        if (!user) {
            return res.status(404).json("user not found")
        }
        res.status(200).json({
            message:"get user successfully" ,
            data: user
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get user",
        })
    }
})


// login
router.post('/login' , async(req,res)=>{
    try {
        const user = await User.findOne({email : req.body.email})
        if (!user) {
            return res.status(400).json({message : "you should register first"})
        }
        // check password
        const isMatch = await bcrypt.compareSync(req.body.password, user.passwordHash) ;
        if (!isMatch) {
            return res.status(400).json({message : "error in password or email"})
        }
        //create token
        const token = await jwt.sign({
            id : user.id ,
            isAdmin : user.isAdmin
        } , process.env.SECRET , {expiresIn:"1d"})
        res.status(200).json({
            success:true ,
            message : "you are register successfully",
            data : {user , token}
        })
        
        
    } 
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error happened while login",
        })
    }
})

module.exports = router