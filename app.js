import createError from 'http-errors';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import logger from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import _ from './env.js';

const app = express();

// session setup
// WARNING: session storage is set to MemoryStore on purpose, for development
// WARNING: for production use one of options recommended here: http://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
const store = new session.MemoryStore();
app.use(
  session({
    secret: "very_secret_session",
    cookie: { maxAge: 1000 * 60 * 60 * 24, secure: false, sameSite: "none", httpOnly: true },
    resave: true,
    saveUninitialized: false,
    store
  })
);

// view engine setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// import and mount routers
import indexRouter from './routes/index-routes.js';
import usersRouter from './routes/users-routes.js';
import productRouter from './routes/products-routes.js';
import cartRouter from './routes/cart-routes.js';
import orderRouter from './routes/orders-routes.js';

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
