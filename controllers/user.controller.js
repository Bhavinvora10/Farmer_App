/* eslint-disable import/no-useless-path-segments */
/* eslint-disable prettier/prettier */

const User = require('./../model/user');
const sendEmail = require('./../utils/email');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const generator = require('generate-password');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.create = catchAsync (async (req, res, next) => {
    const pass = generator.generate({
        length: 8,
        numbers: true
    });
    
    var newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: pass,
        passwordConfirm: pass,
        role: req.body.role,
    });

    if (req.body.role === "farmer") {
        const customer = await stripe.customers.create({
            name: newUser.name,
            email: newUser.email,
            description: "land farm's farmer"
        });

        newUser = await User.findOneAndUpdate(
            { _id: newUser._id },
            { customerId: customer.id },
            { new: true }
        );
    };

    await sendEmail({
        email: newUser.email,
        subject: 'Your random generated password',
        message: `Your email : ${req.body.email} \nYour password : ${pass}`,
    });

    res.status(200).json({
        status: 200,
        message: 'user created successfully!',
        data: newUser
    });
});

exports.getAll = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 200,
        data: users
    });
});

exports.get = catchAsync (async (req, res, next) => {
    const getUser = await User.findById(req.params.id);

    if (!getUser) {
        return next(new AppError('No user found with this ID', 404));
    }

    res.status(200).json({
        status: 200,
        data: getUser
    });
});

exports.update = catchAsync(async (req, res, next) => {
    const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updateUser) {
        return next(new AppError('No user found with this ID', 404));
    }

    res.status(200).json({
        status: 200,
        message: 'user updated successfully'
    });
});

exports.delete = catchAsync(async (req, res, next) => {
    const deleteUser = await User.findByIdAndUpdate(
        { _id: req.params.id },
        { isActive: false },
        { new: true }
    );

    if (!deleteUser) {
        return next(new AppError('No user found with this ID', 404));
    };

    res.status(200).json({
        status: 200,
        message: 'user successfully deleted'
    });
});
