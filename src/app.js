import express from 'express'
const app = express()
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import ApiError from './utils/ApiError.js'
import { responseMiddleware } from './utils/ApiResponse.js'
app.use(cors({
    // origin:[process.env.CORS_ORIGIN] ,
    origin:`http://localhost:5173 `,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use(cookieParser())
app.use(responseMiddleware)
app.get('/', (req,res)=>{
    res.send("Server is Running !!")
})

app.use((req, res, next) => {
  console.log("➡️ Request:", req.method, req.originalUrl);
  next();
});




// user routes
import userRoutes from './routes/user.route.js'
app.use('/api/v1/user', userRoutes)

//blog routes
import BlogRoutes from './routes/blog.routes.js'
app.use('/api/v1/blog' , BlogRoutes)

//product 
import ProductRoutes from './routes/product.routes.js'
app.use("/api/v1/product", ProductRoutes)

//product 
import TeamRoutes from './routes/team.routes.js'
app.use("/api/v1/team", TeamRoutes)

//product 
import InquiryRoutes from './routes/inquiry.routes.js'
app.use("/api/v1/inquiry", InquiryRoutes)


//news latter
import NewsLatterRoutes from './routes/newsLatter.routes.js'
app.use("/api/v1/news-latter", NewsLatterRoutes)

//gallery routes
import GalleryRoutes from './routes/gallery.routes.js'
app.use("/api/v1/gallery", GalleryRoutes)



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
      stack:err.stack,
      timestamp: new Date().toISOString(),
    });
  }
  res.status(500).json({ message: "Internal Server Error" });
});

export {app}