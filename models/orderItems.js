const mongoose = require('mongoose')

const orderItemsSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

orderItemsSchema.virtual('id').get( function () {
    return this._id.toHexString()
})

orderItemsSchema.set('toJSON' ,{
    virtuals : true 
})

const OrderItems = mongoose.model("OrderItems" , orderItemsSchema)
module.exports= OrderItems;