import express, { Request, Response } from 'express';
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import authRoutes from './routes/auth.routes';
// import eventRoutes from "./routes/event.routes";

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;



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