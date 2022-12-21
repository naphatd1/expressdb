const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const passport = require('passport')
const rateLimit = require('express-rate-limit')

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

//import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors())

app.set('trust proxy', 1)

const limiter = rateLimit({
	windowMs: 10 * 1000, 
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

app.use(helmet())
app.use(morgan('combined'))



app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize())

app.use("/", indexRouter);
app.use("/users", usersRouter);


app.use(errorHandler);

module.exports = app;
