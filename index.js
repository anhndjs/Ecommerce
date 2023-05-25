const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const morgan = require('morgan');
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandle');

const app = express();

const PORT = process.env.PORT || 4000;
const authRouter = require('./routes/authRoute');
const productRoute = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const categoryRouter = require('./routes/categoryRoute');
const blogCatRouter = require('./routes/blogCatRoute');
const couponRouter = require('./routes/couponRoute');

dbConnect();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/user', authRouter);
app.use('/api/product', productRoute);
app.use('/api/blog', blogRouter);
app.use('/api/category', categoryRouter);
app.use('/api/blogCat', blogCatRouter);
app.use('/api/coupon', couponRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`server is runing at PORT ${PORT}`);
});
