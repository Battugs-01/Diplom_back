const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const bcrypt = require("bcrypt");
const myError = require("../utils/myError");

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

exports.getDoctors = asyncHandler(async (req, res, next) => {
  console.log("PARAMS", req.params)
  const doctor = await req.db.employee.findAll({
    where: { role: "doctor" },
  });

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

exports.getDrivers = asyncHandler(async (req, res, next) => {
  console.log("PARAMS", req.params)
    const driver = await req.db.employee.findAll({
      where: { role: "driver" },
    });

  res.status(200).json({
    success: true,
    data: driver,
  });
})

exports.getEmployees = asyncHandler(async (req, res, next) => {
  console.log("PARAMS", req.params)
  var role = req.params.role;
  console.log(req.db)
  if (role != undefined) {
    const employee = await req.db.employee.findAll({
      where: { role: role },
    });
  } else {
    const employee = await req.db.employee.findAll();
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// neg hereglegch ID-aar shuuj harah
exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await req.db.employee.findByPk(req.params.id);
  if (!employee) {
    throw new MyError(`employee with id ${req.params.id} not found`, 404);
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.createEmployee = asyncHandler(async (req, res, next) => {
  const employee3 = await req.db.employee.findOne({
    where: { email: req.body.email },
  });
  console.log(employee3);
  if (employee3 != null) {
    throw new MyError(`Уучлаарай. Бүртгэлтэй хэрэглэгч байна`, 400);
  }
  const employee2 = await req.db.employee.findOne({
    where: { phone: req.body.phone },
  });
  if (employee2 != null) {
    throw new MyError(`Уучлаарай. Бүртгэлтэй хэрэглэгч байна`, 400);
  }

  req.body.password = bcrypt.hashSync(req.body.password, salt);

  const employee = await req.db.employee.create(req.body);

  res.status(200).json({
    success: true,
    data: employee,
  });
});

// hereglegch oorchloh
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const employee = await req.db.employee.findByPk(req.params.id);

  if (!employee) {
    throw new MyError(`employee with id ${req.params.id} not found`, 404);
  }

  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, salt);
  }

  await employee.update(req.body);
  res.status(200).json({
    success: true,
    data: employee,
  });
});

// hereglegch ustgah
exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await req.db.employee.findByPk(req.params.id);

  if (!employee) {
    throw new MyError(`employee with id ${req.params.id} not found`, 404);
  }

  await employee.destroy();

  res.status(200).json({
    success: true,
    data: employee,
  });
});
