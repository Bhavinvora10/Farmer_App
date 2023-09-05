// Global Error Handling 
const AppError = require('./../utils/appError');

// Invalid ID
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);
}

// Duplicate fields
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}, Please use another value.`
    return new AppError(message, 400);
}

// Validation error
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el = el.message);

    console.log(err);
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400);
}

const sendDevError = (err, req, res) => {
    console.log(err);
    res.status(err.statusCode).json({
        status: err.status,
        err: err,
        message: err.message,
        stack: err.stack
    });
};

const sendProdError = (err, req, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Somethinng went wrong!'
        });
    }
    
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.name === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendProdError(error, req, res);
    }
}