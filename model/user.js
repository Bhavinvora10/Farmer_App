const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        rquired: [true, 'Please tell us your name!'],
    },
    email: {
        type: String,
        rquired: [true, 'Please provide your email.'],
        unique: true,
        lowercase: true, // It is not validater but email convert in to lower case.
        validate: [validator.isEmail, 'Please provide a valid email.'] // Validate the email.
    },
    role: {
        type: String,
        enum: ['farmer', 'field', 'superAdmin'],
        default: 'farmer'
    },
    password: {
        type: String,
        require: [true, 'Please provide your password.'],
        minlength: 8,
        select: false
    },
    passwordConfirm: { 
        type: String,
        require: [true, 'Please confirm your password.'],
        validate: {
            // ! This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    paymentStatus: {
      type: String,
      enum: ['complete', 'failed', 'pending'],
      default: 'pending',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    farmer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Farmer',
    },
    fielduser: {
        type: mongoose.Schema.ObjectId,
        ref: 'fieldUser',
    },
    customerId:{
        type:String
    }
});

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually not modified.
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) { // ! Reset functionality 
    // password is not changed or document is new so simply go to the next.
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; // 1000(milliseconds)
    next();
});

userSchema.virtual("farmers", {
    ref: "Farmer",
    foreignField: "userId",
    localField: "_id",
  });

  userSchema.virtual("fieldusers", {
    ref: "fieldUser",
    foreignField: "userId",
    localField: "_id",
  });

// correctPassword() is instance method;
// this method is always there in all the documents.
// Return true or false
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        // parseInt(Date String, base(10)) <- use for typeCasting
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // console.log({resetToken}, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;