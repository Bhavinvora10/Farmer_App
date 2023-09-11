const mongoose = require("mongoose");
const validator = require('validator');

const farmerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    parentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    firstName: {
      type: String,
      required: [true, "A farmer must have a first name"],
      trim: true, // remove whitespace in the beginning and end of the string.
    },
    lastName: {
      type: String,
      required: [true, "A farmer must have a last name"],
      trim: true, // remove whitespace in the beginning and end of the string.
    },
    mobileNumber: {
      type: String,
      unique: true, // Unique is not a validater.
      validate: {
        validator: function (n) {
          return n.length === 10;
        },
        message: "Mobile number invalid",
      },
    },
    landSize: {
      type: Number,
      required: [true, "A farmer must have a mobile number"],
    },
    landUnit: {
      type: String,
      enum: ["square-feet", "hector", "bigha", "acre"],
    },
    photoUrl: String,
    paymentIds: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "paymentHistory",
      },
    ],
    landImagesId: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "landImage",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

farmerSchema.virtual("paymentHistorys", {
  ref: "paymentHistory",
  foreignField: "paymentBy",
  localField: "_id",
});

farmerSchema.virtual("landImages", {
  ref: "landImage",
  foreignField: "createdBy",
  localField: "_id",
});

farmerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'paymentIds',
    select: '-__v -paymentBy -isActive'
  });
  next();
});

farmerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'landImagesId',
    select: '-__v -createdBy -isActive'
  });
  next();
});

farmerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'email role'
  }).populate({
    path: 'parentId',
    select: 'email role'
  });
  next();
});

const Farmer = mongoose.model("Farmer", farmerSchema);

module.exports = Farmer;
