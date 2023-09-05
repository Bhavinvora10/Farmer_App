/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
 
dotenv.config();
const app = require('./app');

mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true
    })
    .then((con) => {
        // console.log(con.connections);
        console.log('DB connection Successful!');
    }).catch(error => {
        console.log('Error....', error);
    });

    

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
