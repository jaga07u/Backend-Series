// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';


dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    // app.on("er")
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`My server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB Connection failed !!!",err);
})









// import express from 'express'
// // const connectDB=()=>{
// // }
// // connectDB()
// const app=express();
// ( async ()=>{
//     try {
//        await mongoose.connect(`${process.env.MOGODB_URL}/${DB_NAME}`)
//        app.on('error',(error)=>{
//         console.log("ERROR",error);
//         throw error
//        })

//        app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port${process.env.PORT} `);
//        })
//     } catch (error) {
//         console.error("Error",error);
//         throw error
//     }
// })()