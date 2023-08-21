const express = require('express');
const Product = require('../models/product');
const Category = require('../models/category');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middleware/verifyToken')
const validateObjectId =require('../middleware/validateObjectId')



///// middleware to upload image
const FILE_TYPE_MAP ={
    'image/png' : 'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('invalid image type')
        if (isValid) {
            uploadError=null
        }
        cb(uploadError , 'uploads')
    },
    filename :function  (req,file,cb){
        
        const fileName = file.originalname.split(' ').join("_")
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null , `${fileName}_${Date.now()}.${extension}`);
    }
})

const uploadOption = multer({storage : storage})




// create new product
router.post('/',verifyTokenAndAdmin, uploadOption.single('image') ,  async(req,res)=>{
    try {
        
        const category = await Category.findById( req.body.category)
        if (!category) {
            return res.status(404).json("category not found")
        }
        const file = req.file
        if (!file) {
            return res.status(404).json("image not found")
        }
        
        const fileName = req.file.filename
        const baseFile = `${req.protocol}://${req.get('host')}/uploads/`

        const product = new Product({
            name :  req?.body.name  ,
            description :  req?.body.description  ,
            richDescription : req?.body.richDescription  ,
            image: `${baseFile}${fileName}`  ,
            images: req?.body.images  ,
            price :  req?.body.price  ,
            category :  req?.body.category  ,
            countInStock :  req?.body.countInStock  ,
            rating :  req?.body.rating  ,
            numReviews :  req?.body.numReviews  ,
            isFeatured : req?.body.isFeatured    
        })
        if (!product) {
            return res.status(400).json({ message : "cant create this product" })
        }
        await product.save();
        res.status(200).json({
            message:"Product created successfully" ,
            data: product
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in post new product",
        })
    }
} )


// get all products with filtration by categories
router.get('/',verifyTokenAndAuthorization, async(req,res)=>{
    try {
        let filter = {}
        if (req.query.categories) {
            filter = {category :req.query.categories.split(',')}
        }
        const product = await Product.find(filter).populate("category")
        if (!product) {
            return res.status(404).json("there are no products")
        }
        res.status(200).json({
            message:"Products List" ,
            data: product
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get all products",
        })
    }
})


// get single product
router.get('/:id' ,validateObjectId,verifyTokenAndAuthorization, async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id).populate("category")
        if (!product) {
            return res.status(404).json("product not found")
        }
        res.status(200).json({
            message:"get Product successfully" ,
            data: product
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get product",
        })
    }
})


// update product
router.put('/:id' ,validateObjectId,verifyTokenAndAdmin, async(req,res)=>{
    try {
        const product = await Product.findByIdAndUpdate(req.params.id ,{
            name :  req?.body.name  ,
            description :  req?.body.description  ,
            richDescription : req?.body.richDescription  ,
            image: req?.body.image  ,
            images: req?.body.images  ,
            price :  req?.body.price  ,
            category :  req?.body.category  ,
            countInStock :  req?.body.countInStock  ,
            rating :  req?.body.rating  ,
            numReviews :  req?.body.numReviews  ,
            isFeatured : req?.body.isFeatured   

        } ,{new :true}).populate("category")
        if (!product) {
            return res.status(404).json("product not found")
        }
        res.status(200).json({
            message:"update Product successfully" ,
            data: product
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get product",
        })
    }
})


// get single product
router.delete('/:id',validateObjectId,verifyTokenAndAdmin, async(req,res)=>{
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) {
            return res.status(404).json("product not found")
        }
        res.status(200).json({
            success : true ,
            message:"Product deleted successfully" ,
            deleted_product: product
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in delete product",
        })
    }
})


// get products count
router.get('/get/count',verifyTokenAndAdmin, async(req,res)=>{
    try {
        const productCount = await Product.countDocuments()
        if (!productCount) {
            return res.status(404).json({
                message : "there are no product"
            })
        }
        res.status(200).json({
            message:"get Products number successfully" ,
            productCount: productCount
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get product",
        })
    }
})


// get is Featured product
router.get('/get/isFeatured' , async(req,res)=>{
    try {
        const product = await Product.find({isFeatured : true}).populate("category")
        if (!product) {
            return res.status(404).json({
                message : "there are no product is Featured"
            })
        }
        res.status(200).json({
            message:"get Products Featured successfully" ,
            data: product
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get Featured product",
        })
    }
})

// get is Featured count
router.get('/get/Featured/:count' , async(req,res)=>{
    try {
        const count = req.params.count? req.params.count :0
        const products = await Product.find({isFeatured : true}).limit(+count)
        if (!products) {
            return res.status(404).json({
                message : "there are no product is Featured"
            })
        }
        res.status(200).json({
            message:"get Products Featured count successfully" ,
            data: products
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get Featured product",
        })
    }
})


// upload image Gallery
router.put("/gallery-images/:id",validateObjectId,verifyTokenAndAdmin, uploadOption.array('images',8), async(req,res)=>{
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({message : "inValid product Id"})
        }
        const files = req.files
        let imagesPaths = []
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`
        if(files){
            files.map((file)=>{
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        }

        const product = await Product.findByIdAndUpdate(req.params.id ,{
            images : imagesPaths
        },{new :true})
        if (!product) {
            return res.status(400).json({ message : "cant create this product images gallery" })
        }
        await product.save();
        res.status(200).json({
            message:"product images gallery created successfully" ,
            data: product
        })

    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in put the images gallery",
        })
    }
})

module.exports = router