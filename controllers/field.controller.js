const fieldUser = require('./../model/fieldUser');
const User = require('./../model/user');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

exports.create = catchAsync(async (req, res, next) => {
    const newFieldUser = await fieldUser.create({
        userId: req.body.userId,
        parentId: req.user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber
    });
    // console.log(newFieldUser);

    await User.findByIdAndUpdate(
      { _id: req.body.userId },
      { fielduser: newFieldUser._id },
    );

    res.status(200).json({
        status: 'success',
        data: newFieldUser
    });
});

exports.getAll = catchAsync(async (req, res, next) => {
    const fieldUsers = await fieldUser.find();

  res.status(200).json({
    status: 200,
    message: 'fielduser data found',
    data: fieldUsers
  });
});

exports.get = catchAsync(async (req, res, next) => {
  const getFieldUser = await fieldUser.findById(req.params.id);

  if (!getFieldUser) {
    return next(new AppError("No fielduser found with this ID", 404));
  }

  res.status(200).json({
    status: 200,
    message: 'fielduser data found',
    data: getFieldUser
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const updateFieldUser = await fieldUser.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updateFieldUser) {
        return next(new AppError('No fielduser found with this ID', 404));
    }

  res.status(200).json({
    status: 200,
    message: "Update successfully"
  });
});

// exports.delete = catchAsync(async (req, res, next) => {
//   const deleteFieldUser = await fieldUser.findByIdAndUpdate(
//     { _id: req.params.id },
//     { isActive: false },
//     { new: true }
//   );

//   if (!deleteFieldUser) {
//     return next(new AppError("No fielduser found with this ID", 404));
//   }

//   res.status(200).json({
//     status: 200,
//     message: "deleted successfully",
//   });
// });
