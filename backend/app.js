import express from 'express';

const app = express();

app.use(express.json(1));

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'});
});

export default app;