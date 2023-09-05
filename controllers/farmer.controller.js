const Farmer = require('./../model/farmer');
const fieldUser = require('./../model/fieldUser');
const User = require('./../model/user');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.create = catchAsync(async (req, res, next) => {
    const newFarmer = await Farmer.create({
        userId: req.body.id,
        parentId: req.user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        landSize: req.body.landSize,
        landUnit: req.body.landUnit
    });
    // console.log(newFarmer);

    await User.findByIdAndUpdate(
        { _id: req.body.id },
        { farmer: newFarmer._id },
    );

    const data = await fieldUser.findOneAndUpdate(
        { userId: req.user._id },
        { $push: { farmers: newFarmer._id } },
        { new: true }
    );
    // console.log("data", data);

    res.status(200).json({
        status: 200,
        message: "farmer created",
        data: newFarmer,
    });
});

exports.getAll = catchAsync(async (req, res, next) => {
    const farmers = await Farmer.find();

    res.status(200).json({
        status: 200,
        message: "farmer data found",
        data: farmers
    });
});

exports.get = catchAsync(async (req, res, next) => {
    const getFarmer = await Farmer.findById(req.params.id);

    if (!getFarmer) {
        return next(new AppError('Farmer not found with this ID', 404));
    };

    res.status(200).json({
        status: 200,
        message: 'farmer data found',
        data: getFarmer,
    });
});

exports.update = catchAsync(async (req, res, next) => {
    const updateFarmer = await Farmer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updateFarmer) {
        return next(new AppError('No farmer found with this ID', 404));
    }

    res.status(200).json({
        status: 200,
        message: "Update successfully",
    });
});

exports.delete = catchAsync(async (req, res, next) => {
    const deleteFarmer = await Farmer.findByIdAndUpdate(
        { _id: req.params.id },
        { isActive: false },
        { new: true }
    );

    if (!deleteFarmer) {
        return next(new AppError('No farmer found with this ID', 404));
    };

    res.status(200).json({
        status: 200,
        message: "deleted successfully"
    });
});
