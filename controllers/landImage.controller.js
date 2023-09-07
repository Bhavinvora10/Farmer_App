const Farmer = require("./../model/farmer");
const landImage = require("./../model/landImages");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.create = catchAsync (async (req, res, next) => { 
    // console.log('user', req.user);
    const newimage = await landImage.create({
        createdBy: req.user.farmer._id,
        imageUrl: req.body.urlData.URL
    });
    // console.log(newimage);

    const data = await Farmer.findOneAndUpdate(
        { _id: req.user.farmer._id },
        { $push: { landImagesId: newimage._id } },
        { new: true });
        // console.log("data", data);

    res.status(200).json({
        status: 200,
        message: "landImage created",   
    });
});

exports.getAll = catchAsync (async (req, res, next) => {
    const images = await landImage.find();

    res.status(200).json({
        status: 200,
        message: "landImage data found",
        data: images,
    });
});

exports.get = catchAsync (async (req, res, next) => {
    const getlandimg = await landImage.findById(req.params.id);

    if(!getlandimg) {
        return next(new AppError('Landimage not found with this ID', 404));
    };

    res.status(200).json({
        status: 200,
        message: 'landimage data found',
        data: getlandimg,
    });
});

exports.update = catchAsync (async (req, res, next) => {
    const updateimage = await landImage.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updateimage) {
        return next(new AppError('No image found with this ID', 404));
    }

    res.status(200).json({
        status: 200,
        message: "Update successfully",
    });
});

exports.delete = catchAsync (async (req, res, next) => {
    const deleteimage = await landImage.findByIdAndUpdate(
        { _id: req.params.id },
        { new: true });

    if (!deleteimage) {
        return next(new AppError('No image found with this ID', 404));
    }

    res.status(200).json({
        status: 200,
        message: "deleted successfully"
    });
});
