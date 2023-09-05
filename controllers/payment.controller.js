const User = require('./../model/user');
const paymentHistory = require('./../model/paymentHistory');
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


exports.createCheckOutSession = catchAsync (async (req, res, next) => {
    const user = await User.findById(req.params.id);
    // console.log(user);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        client_reference_id: user.customerId,
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: 'inr',
                unit_amount: req.body.amount * 100,
                product_data: {
                    name: user.name,
                }
            },
            quantity: 1
        }],
        success_url: `${req.protocol}://${req.get('host')}/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    });
    // console.log(session);

    if(session.id === undefined || session.id === null) {
        return res.status(400).json({
            status: 400,
            message:'session not created',
        });
    };

    const newPayment = await paymentHistory.create({
        paymentBy: req.params.id,
        amount: req.body.amount,
        paymentDate: Date.now(),
        checkOut_id: session.id
    });

    res.status(200).json({
        status: 200,
        id: session.id,
        URL: session.url,
        session
    });
});

exports.createWebhook = catchAsync (async (req, res) => {
    const payHistory = await paymentHistory.findOne({ checkOut_id: req.body.data.object.id });

    let user;
    if (payHistory) {
        user = await User.findById(req.params.id);
        user.status = req.body.data.object.payment_status;
        user.save();

        await paymentHistory.findOneAndUpdate(
            { paymentBy: req.params.id },
            { paymentStatus: user.status },
        );

        res.status(200).json({
            status: "200",
            message: "Payment successfull",
        });
    } else {
        user = await User.findOneAndUpdate(
            { _id: req.params.id },
            { status: "failed", isActive: false },
        );

        await paymentHistory.findOneAndUpdate(
            { paymentBy: req.params.id },
            { paymentStatus: "failed" },
        );

        res.status(404).json({
            status: "404",
            message: "Payment failed",
        });
    }
});

exports.getAll = catchAsync(async (req, res, next) => {
    const allPaymets = await paymentHistory.find();

    res.status(200).json({
        status: 200,
        message: "payment data found",
        data: allPaymets,
    });
});

exports.get = catchAsync (async (req, res, next) => {
    const getPayment = await paymentHistory.findById(req.params.id);

    if(!getPayment) {
        return next(new AppError('Payment not found with this ID', 404));
    };

    res.status(200).json({
        status: 200,
        message: 'payment data found',
        data: getPayment,
    });
});