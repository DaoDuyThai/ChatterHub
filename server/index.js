import express from 'express';
//middleware to parse incoming request bodies in a middleware before your handlers, available under the req.body property.
import bodyParser from 'body-parser';
//provides a schema-based solution to model your application data and includes features for validation, query building, and more. Mongoose simplifies interactions with MongoDB databases in Node.js applications.
import mongoose from 'mongoose';
//provides a Connect/Express middleware that can be used to enable Cross-Origin Resource Sharing with various options.
import cors from 'cors';
//load environment variables from a .env file into your Node.js application. Environment variables are often used to store configuration settings, API keys, and other sensitive information without hardcoding them into your code.
import dotenv from 'dotenv';
//handling multipart/form-data, which is used for uploading files in HTML forms. It is designed for handling enctype="multipart/form-data" forms, which are typically used for uploading files. Multer makes it easy to handle file uploads in Node.js applications.
import multer from 'multer';
//helps secure your Express applications by setting various HTTP headers.
import helmet from 'helmet';
//HTTP request logger middleware for Node.js. It simplifies the process of logging requests made to your server, providing information such as the request method, URL, status code, response time, and more. Morgan is often used during development and debugging to gain insights into incoming requests and server responses.
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js"
import { register } from "./controllers/auth.js"
import { verifyToken } from './middleware/auth.js';
import { createPost } from './controllers/posts.js';
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts} from "./data/index.js";

/* CONFIGURATIONS*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('common'));
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// ROUTES WITH FILES 
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

//ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/*MONGOOSE SETUP*/
const PORT = process.env.PORT || 6001;
mongoose
.connect('mongodb+srv://dummyuser:dummyuser@cluster0.9e0s3qd.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
    //Add data one time only
    // User.insertMany(users);
    // Post.insertMany(posts);
}).catch((error) => console.log(`${error} did not connect`));