const mongoose = require('mongoose');
const validator = require('validator');

const fieldSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    parentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    firstName: {
        type: String,
        required: [true, 'user must have a first name'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'user must have a last name'],
        trim: true,
    },
    mobileNumber: {
        type: String,
        unique: true,
        required: [true, 'user must have a mobile number'],
        validate: {
            validator: function(n) {
                return n.length === 10;
            },
            message: 'Mobile number invalid'
        },
    },
    photo: {
        type: String
    },
    farmers: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Farmer',
        }
    ],
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

fieldSchema.virtual("farmer", {
    ref: 'Farmer',
    foreignField: 'createdBy',
    localField: "_id",
});

// Query Middleware
fieldSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'farmers',
        select: { '__v':0, 'paymentIds':0, 'parentId':0}
    });
    next();
});

fieldSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'userId',
        select: 'email role'
    }).populate({
        path: 'parentId',
        select: 'email role'
    });
    next();
});


const fieldUser = mongoose.model('fieldUser', fieldSchema);

module.exports = fieldUser;