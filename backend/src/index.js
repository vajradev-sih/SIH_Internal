import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Load environment variables
dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Express app error:", error);
            throw error;
        });

        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
            console.log(`Login endpoint available at: http://localhost:${PORT}/api/v1/users/login`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed:", error);
        process.exit(1);
    });
