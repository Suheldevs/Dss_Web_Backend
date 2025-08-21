import express from 'express'
const app = express()
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {ApiError} from './utils/ApiError.js'
import { responseMiddleware } from './utils/ApiResponse.js'
app.use(cors({
    origin:process.env.CORS_ORIGIN ,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use(cookieParser())
app.use(responseMiddleware)
app.get('/', (req,res)=>{
    // res.api(200, "Server is running !!")
    res.send("Server is Running !!")
})


// user routes
import userRoutes from './routes/user.route.js'
app.use('/user', userRoutes)

//file test url 
import fileTestRoutes from './routes/fileTest.routes.js'
import path from 'path'
app.use('/file',fileTestRoutes)

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});


// api error responce
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      data: err.data,
      timestamp: new Date().toISOString(),
    });
  }
  res.status(500).json({ message: "Internal Server Error" });
});

export {app}