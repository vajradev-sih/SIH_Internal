import dotenv from "dotenv"
import connectDB from "./db/index.js"


dotenv.config({
    path: './env'
})
connectDB()
// .then(() => { 
//     app.on("error" , (error)=> {
//         console.log("SOMETHING WENT WRONG: ", error);
//         throw error
//     })
//     app.listen(port , () => {
//         console.log(`Server is running at port: ${port}`);
        
//     })
// })
// .catch((err) => {
//     console.log("MONGODB connection ERROR !!!: ", err);  
// })