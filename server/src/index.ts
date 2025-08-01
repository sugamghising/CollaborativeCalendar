import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import authRoutes from './routes/auth.routes';
import cors from 'cors';
// import eventRoutes from "./routes/event.routes";

const app = express();
dotenv.config();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/events", eventRoutes);



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;