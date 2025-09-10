// import express, { urlencoded } from "express"
// import cors from "cors"
// import cookieParser from "cookie-parser"


// const app = express()

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))


// app.use(express.json({limit: "16kb"}))
// app.use(urlencoded({extended: true, limit: "16kb"}))
// app.use(express.static("public"))
// app.use(cookieParser())


// export { app }




import express from 'express';
import { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Importing the route files
import userRoutes from "./routes/user.routes.js"
// import reportRoutes from "./routes/reportRoutes.js"; // Placeholder for future routes

const app = express();

// Middleware to set up CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));

// Middleware to serve static files
app.use(express.static("public"));

// Middleware to parse cookies
app.use(cookieParser());


// ------------------ API Routes ------------------
// Base route for all user-related endpoints
app.use("/api/v1/users", userRoutes);

// Base route for all report-related endpoints
// app.use("/api/reports", reportRoutes);


// This app object is exported to be used in index.js
export { app };