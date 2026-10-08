import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({path: '.env.test'});

const port = process.env.PORT || 3000; 

app.listen(port, () => {
   console.log(`Appistening on port ${port}`);   
});