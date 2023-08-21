const express = require('express');
const Order = require('../models/order');
const OrderItems = require('../models/orderItems');
const Product = require('../models/product')
const router = express.Router();
const { verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middleware/verifyToken')
const validateObjectId =require('../middleware/validateObjectId')


// create new product
router.post('/' ,verifyTokenAndAdmin,  async(req,res)=>{
    try {
        const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem=>{
            let newOrderItem = new OrderItems({
                quantity : orderItem.quantity ,
                product  : orderItem.product
            })
            newOrderItem = await newOrderItem.save();

            return newOrderItem.id
        }))
        const newOrderItemResolved =await orderItemsIds;
        console.log(newOrderItemResolved);

        const totalPrices = await Promise.all(newOrderItemResolved.map(async (orderItemId) => {
            const orderItem = await OrderItems.findById(orderItemId).populate('product', 'price');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        }));
        
        const totalPrice = totalPrices.reduce((a, b) => a + b , 0);
        console.log(totalPrice);
        
        const order = new Order({
            orderItems :  newOrderItemResolved  ,
            shippingAddress1 :  req?.body.shippingAddress1  ,
            shippingAddress2 : req?.body.shippingAddress2  ,
            city: req?.body.city  ,
            zip: req?.body.zip  ,
            country :  req?.body.country  ,
            phone :  req?.body.phone  ,
            status :  req?.body.status  ,
            totalPrice :  totalPrice , 
            user :  req?.body.user    
        })
        if (!order) {
            return res.status(400).json({ message : "cant create this order" })
        }
        await order.save();
        res.status(200).json({
            message:"order created successfully" ,
            data: order
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error in post new order",
        })
    }
} )



// get orders
router.get('/' ,verifyTokenAndAdmin, async(req,res)=>{
    try {
        const orderList = await Order.find({})
        .populate('user' , 'name')

        if (!orderList) {
            return res.status(404).json({message : "orderList not found"})
        }
        res.status(200).json({
            message : "orderList list" ,
            orders : orderList
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error ,
            message: " Error in get orders",
        })
    }
})


// get single order
router.get('/:id',validateObjectId ,verifyTokenAndAuthorization, async(req,res)=>{
    try {
        const order = await Order.findById(req.params.id)
        .populate('user' , 'name')
        // error here///////////////////////////////////////////////
        .populate({ 
            path: 'orderItems', populate: {
                path : 'product', populate: 'category'} 
            })
        // .populate("orderItems")
        .sort({ "dateOrdered" : -1})
        
        if (!order) {
            return res.status(404).json({message : "order not found"})
        }
        res.status(200).json({
            success : true,
            orders : order
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error in get order",
        })
    }
})


// update order status by Admin
router.put("/:id",validateObjectId ,verifyTokenAndAdmin,async(req,res)=> {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id ,{
            status : req.body.status
        },{new :true})
        if (!order) {
            return res.status(400).json({message: "cant find order",})
        }
        res.status(200).json({
            message : "order has been updated ",
            data : order
        })
    }
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error in update order status",
        })
    }
})



// delete order
router.delete("/:id",validateObjectId ,verifyTokenAndAuthorization,async(req,res)=> {
    try {
        Order.findByIdAndDelete(req.params.id)
        .then( async (order) =>{
            if (order) {
                await order.orderItems.map(async orderItem =>{
                    await OrderItems.findByIdAndRemove(orderItem)
                })
                return res.status(200).json({message : "order has been deleted ",data : order})
            }else{
                return res.status(404).json({message : "order Not found "})

            }
        })
    }
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error in delete order",
        })
    }
})


// get total sales
router.get('/get/totalSales' ,verifyTokenAndAdmin, async(req,res)=>{
    try {
        const totalSales = await Order.aggregate([
            {$group : { _id : null , totalSales : {$sum : '$totalPrice'}}}
        ])
        console.log(totalSales);
        if (!totalSales) {
            return res.status(404).json({message : "the order sales cannot be generated"})
        }
        res.status(200).json({
            success : true ,
            totalSales : totalSales.pop().totalSales
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error in get total sales of orders",
        })
    }
})



// get orders count
router.get('/get/countorders' ,verifyTokenAndAdmin, async(req,res)=>{
    try {
        const ordersCount = await Order.countDocuments()
        if (!ordersCount) {
            return res.status(404).json({message : "there are no orders"})
        }
        res.status(200).json({
            success : true ,
            ordersCount : ordersCount
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error in get count of orders",
        })
    }
})


// get user orders
router.get('/get/userOrders/:userId' ,validateObjectId ,verifyTokenAndAdmin, async(req,res)=>{
    try {
        const userOrders= await Order.find({ user :req.params.userId})
        .populate({
            path : 'orderItems' , populate : {
                path : 'product' , populate: 'category'
            }
        })
        .sort({'dateOrdered' : -1})
        if (!userOrders) {
            return res.status(404).json({message : "there are no order for this user"})
        }
        res.status(200).json({
            success : true ,
            userOrders : userOrders
        })
    } 
    catch (error) {
        res.status(500).json({
            error : error.message ,
            message: " Error in get user orders",
        })
    }
})



module.exports = router