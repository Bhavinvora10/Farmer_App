const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    paymentBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Farmer",
    },

    amount: {
      type: Number,
      required: [true, "A farmer must have a amount"],
    },
    
    paymentDate: {
      type: Date,
      required: [true, "A farmer must have a payment date"],
    },
    
    checkOut_id:{
      type:String
    },

    status: {
      type: String,
      enum: ['complete', 'failed', 'pending'],
      default: 'pending'
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  },
);

paymentHistorySchema.virtual("farmers", {
  ref: "Farmer",
  foreignField: "paymentIds",
  localField: "_id",
});

const paymentHistory = mongoose.model("paymentHistory", paymentHistorySchema);

module.exports = paymentHistory;
