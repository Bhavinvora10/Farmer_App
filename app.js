const express = require("express");
let cookieParser = require("cookie-parser");
var cors = require("cors");
const bodyParser = require('body-parser')
const farmerRouter = require('./routes/farmer');
const landImageRouter = require('./routes/landImage');
const paymentHistoryRouter = require('./routes/paymentHistory');
const authRouter = require('./routes/auth');
const fieldRouter = require('./routes/field');
const userRouter = require('./routes/user');
const GlobalErrorHandler = require('./controllers/error.controller');

const app = express();
app.use(cookieParser());
// app.get("/", (req, res) => { res.cookie("name", value); });
// app.get("/", (req, res) => {
//     res.send(req.cookies);
// });
app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/api/farmer', farmerRouter);
app.use('/api/landImage', landImageRouter);
app.use('/api/paymentHistory', paymentHistoryRouter);
app.use('/api', authRouter);
app.use('/api/user', userRouter);
app.use('/api/field', fieldRouter);

app.use(GlobalErrorHandler);

global.XMLHttpRequest = require("xhr2");

module.exports = app;