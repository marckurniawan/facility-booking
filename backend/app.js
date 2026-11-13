import express from 'express';
import  authRoutes  from './routes/authRoutes.js'

const app = express();


app.use(express.json());

app.use(authRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        message: 'Internal server error',
    });
});



export default app;