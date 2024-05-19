const myError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const { where } = require("sequelize");
const bcrypt = require("bcrypt");
// buh users-iig harah
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

exports.getUsers = asyncHandler(async (req, res, next) => {
  // const page =parseInt(req.query.page) || 1;
  // const limit =parseInt(req.query.limit) || 10;
  // const select =req.query.select;
  // const sort =req.query.sort;

  // ['page','limit','select','sort'].forEach(el=> delete req.query[el]);

  // pagination
  // const pagination = await paginate (page, limit, User);
  const users = await req.db.user.findAll();
  res.status(200).json({
    success: true,
    data: users,
  });
});

// neg hereglegch ID-aar shuuj harah
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await req.db.user.findByPk(req.params.id);
  if (!user) {
    throw new myError(`User with id ${req.params.id} not found`, 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});
exports.getMe = asyncHandler(async (req,res,next) => {
  const {phone} = req.query
  const user  = await req.db.user.findOne({
    where: {
      phone: phone
    }
  })
  console.log(user);
  res.status(200).json({
    success: true,
    data: user.name,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  if (
    !req.body.email ||
    !req.body.name ||
    !req.body.phone ||
    !req.body.password
  ) {
    throw new myError(`Мэдээлэлээ бүрэн оруулна уу`, 400);
  }

  const user3 = await req.db.user.findOne({
    where: { email: req.body.email },
  });
  console.log(user3);
  if (user3 != null) {
    throw new myError(`Уучлаарай. Бүртгэлтэй хэрэглэгч байна`, 400);
  }
  const user2 = await req.db.user.findOne({
    where: { phone: req.body.phone },
  });
  if (user2 != null) {
    throw new myError(`Уучлаарай. Бүртгэлтэй хэрэглэгч байна`, 400);
  }
  const hashedPass = bcrypt.hashSync(req.body.password, salt);
  const user = await req.db.user.create({
    email: req.body.email,
    name: req.body.name,
    phone: req.body.phone,
    location: req.body.location,
    password: hashedPass,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
  // user.save();
  // res.status(200).json({
  //   success: true,
  //   data: {
  //     email: user.email,
  //     role: user.role,
  //     phone: user.phone,
  //     companyID: user.companyID,
  //   },
  // });
});

// hereglegch oorchloh
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new myError(req.params.id + `: iim ID-tai hereglegch oldsongui`, 400);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// hereglegch ustgah
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new myError(req.params.id + `: iim ID-tai hereglegch oldsongui`, 400);
  }

  user.remove();

  res.status(200).json({
    success: true,
    data: user,
  });
});
