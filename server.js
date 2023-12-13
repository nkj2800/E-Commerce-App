const express= require('express');
const app= express();
const colors= require('colors');
const dotenv= require('dotenv').config();
const port= process.env.PORT || 8080;
const connectDb= require('./config/db');
const morgan= require('morgan');
const errorHandlers= require('./middlewares/errorMIddleware');
const cookieParser= require('cookie-parser');


connectDb();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/product', require('./routes/productRoutes'));

app.use(errorHandlers.notFound);
app.use(errorHandlers.errorHandler);

app.listen(port, () => console.log(`Server is running on PORT ${port}`.cyan.underline))