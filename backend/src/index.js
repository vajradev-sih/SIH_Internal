import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

const port = process.env.PORT || 5000

dotenv.config({
    path: './env'
})
connectDB()
.then(() => { 
    app.on("error" , (error)=> {
        console.log("SOMETHING WENT WRONG: ", error);
        throw error
    })
    app.listen(port , () => {
        console.log(`Server is running at port: ${port}`);
        
    })
})
.catch((err) => {
    console.log("MONGODB connection ERROR !!!: ", err);  
})





// import express from 'express';
// import { MongoClient } from 'mongodb';
// import multer from 'multer';
// import { GridFsStorage } from 'multer-gridfs-storage';
// import { GridFSBucket } from 'mongodb';
// import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Constants for MongoDB
// const MONGODB_URI = 'mongodb://localhost:27017/civic_issues_db';
// const PORT = process.env.PORT || 3000;

// // Initialize Express app
// const app = express();
// app.use(express.json());
// app.use(cors());

// // MongoDB Connection
// let db;
// let gfsBucket;

// async function connectToMongo() {
//   try {
//     const client = new MongoClient(MONGODB_URI);
//     await client.connect();
//     db = client.db();
//     gfsBucket = new GridFSBucket(db, { bucketName: 'uploads' });
//     console.log("Connected to MongoDB successfully!");
//   } catch (error) {
//     console.error("Failed to connect to MongoDB:", error);
//     process.exit(1);
//   }
// }

// // Multer storage engine for GridFS
// const storage = new GridFsStorage({
//   url: MONGODB_URI,
//   file: (req, file) => {
//     return {
//       filename: `${Date.now()}-${file.originalname}`,
//       bucketName: 'uploads'
//     };
//   }
// });

// const upload = multer({ storage });

// // API Endpoints

// // GET /api/reports - Fetch all reports with optional filtering
// app.get('/api/reports', async (req, res) => {
//   try {
//     const filter = {};
//     if (req.query.status) {
//       filter.status = req.query.status;
//     }
//     if (req.query.issueType) {
//       filter.issueType = req.query.issueType;
//     }

//     const reports = await db.collection('reports').find(filter).sort({ createdAt: -1 }).toArray();
//     res.json(reports);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching reports', error });
//   }
// });

// // GET /api/reports/:id - Fetch a single report
// app.get('/api/reports/:id', async (req, res) => {
//   try {
//     const report = await db.collection('reports').findOne({ _id: new ObjectId(req.params.id) });
//     if (!report) {
//       return res.status(404).json({ message: 'Report not found' });
//     }
//     res.json(report);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching report', error });
//   }
// });

// // GET /api/reports/photo/:filename - Stream photo from GridFS
// app.get('/api/reports/photo/:filename', (req, res) => {
//   try {
//     const file = gfsBucket.find({ filename: req.params.filename }).toArray((err, files) => {
//       if (!files || files.length === 0) {
//         return res.status(404).json({ message: 'No file exists' });
//       }
//       gfsBucket.openDownloadStreamByName(req.params.filename).pipe(res);
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error streaming photo', error });
//   }
// });

// // POST /api/reports - Submit a new report
// app.post('/api/reports', upload.single('photo'), async (req, res) => {
//   try {
//     const { title, description, latitude, longitude, issueType, userId } = req.body;
//     const newReport = {
//       title,
//       description,
//       userId,
//       location: {
//         type: 'Point',
//         coordinates: [parseFloat(longitude), parseFloat(latitude)],
//       },
//       issueType,
//       photoUrl: req.file ? `/api/reports/photo/${req.file.filename}` : null,
//       status: 'pending',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };
//     const result = await db.collection('reports').insertOne(newReport);
//     res.status(201).json({ message: 'Report submitted successfully!', reportId: result.insertedId });
//   } catch (error) {
//     res.status(500).json({ message: 'Error submitting report', error });
//   }
// });

// // PUT /api/reports/:id - Update a report's status (for admin)
// app.put('/api/reports/:id', async (req, res) => {
//   try {
//     const { status, assignedTo } = req.body;
//     const reportId = req.params.id;

//     const result = await db.collection('reports').updateOne(
//       { _id: new ObjectId(reportId) },
//       { $set: { status, assignedTo, updatedAt: new Date() } }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: 'Report not found' });
//     }

//     res.json({ message: 'Report updated successfully!' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating report', error });
//   }
// });

// // Start the server
// connectToMongo().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//   });
// });
