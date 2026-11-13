import express from 'express';
import  authRoutes  from './routes/authRoutes.js'
import { notFoundMiddleware } from './middleware/notFound.js';
import { errorHandlerMiddleware } from './middleware/errorHandler.js'
const app = express();


app.use(express.json());

app.use(authRoutes);

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

export default app;