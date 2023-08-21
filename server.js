const express = require('express')
const app = express();
const dotenv = require("dotenv")
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const errorHandler = require('./middleware/error-handler')



// middleware

app.use(express.json())
dotenv.config();
app.use(cors());
app.options('*' , cors());
app.use(morgan('tiny'))
app.use(errorHandler);

// to show image in browser
app.use("/uploads", express.static("uploads"));


// routes
app.use("/api/v1/category" , require('./routes/categories'))
app.use("/api/v1/product" , require('./routes/products'))
app.use("/api/v1/users" , require('./routes/users'))
app.use("/api/v1/order" , require('./routes/orders'))





// database Connection
mongoose.connect('mongodb://127.0.0.1:27017/eShop')
.then(()=>{
    console.log("connected to DB success");
})
.catch((err)=>{
    console.log(err);
})



const port = process.env.PORT || 5000
app.listen(port , ()=>{
    console.log(`Server is running on port ${port}`)
})