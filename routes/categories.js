const express = require('express');
const Category = require('../models/category');
const router = express.Router();
const { verifyTokenAndAdmin } = require('../middleware/verifyToken')
const validateObjectId =require('../middleware/validateObjectId')

// post new category
router.post('/' ,verifyTokenAndAdmin , async(req,res) =>{
    try {
        const category = new Category({
            name :  req?.body.name  ,
            icon :  req?.body.icon  || '' ,
            color : req?.body.color || ''
        })
        await category.save();
        res.status(201).json({
            message :"Category Created Successfully" ,
            data : category
        });
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in post new category",
        })
    }
})


// get all categories
router.get('/' , async(req,res)=>{
    try {
        const categories = await Category.find({})
        if(!categories){
            return   res.status(400).json({message:"No Categories Found"})
        }
        res.status(200).json({
            success: true ,
            message : "category List",
            data : categories
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get categories",
        })
    }
})


// get single category
router.get('/:id',validateObjectId ,verifyTokenAndAdmin , async(req,res)=>{
    try {
        const category = await Category.findById(req.params.id)
        if(!category){
            return   res.status(400).json({message:"can’t Found this Category "})
        }
        res.status(200).json({
            success: true ,
            message : "category List",
            data : category
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get category",
        })
    }
})


// update category
router.put("/:id",validateObjectId ,verifyTokenAndAdmin ,  async (req,res)=>{
    try {
        const category = await Category.findByIdAndUpdate(req.params.id ,{
            name :  req?.body.name,
            icon :  req?.body.icon,
            color : req?.body.color
        }, {new : true})

        if (!category) {
            return res.status(400).json({message: "cant find category",})
        }
        await category.save();
        res.status(200).json({
            message : "updated successfully" ,
            data: category ,
        })

    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in update category",
        })
    }
})


// delete category
router.delete('/:id',validateObjectId ,verifyTokenAndAdmin, async(req,res)=>{
    try {
        const category = await Category.findByIdAndDelete(req.params.id)
        if (!category) {
            return res.status(400).json({message: "cant find category",})
        }
        res.status(200).json({
            message : "category has been deleted ",
            data : category
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in delete category",
        })
    }
})


module.exports = router