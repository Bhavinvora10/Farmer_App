const mongoose = require("mongoose");

const landImageSchema = new mongoose.Schema(
  {
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "Farmer",
      },
   
    imageUrl: {
      type: String,
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
  }
);

landImageSchema.virtual("farmers", {
  ref: "Farmer",
  foreignField: "landImagesId",
  localField: "_id",
});

const landImage = mongoose.model("landImage", landImageSchema);

module.exports = landImage;
