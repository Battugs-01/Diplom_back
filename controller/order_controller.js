const MyError = require("../utils/myError");
const asyncHandler = require("../middleware/asyncHandler");
const sequelize = require("sequelize");

exports.getOrders = asyncHandler(async (req, res, next) => {
  const orders = await req.db.order
    .scope({ method: ["filter_by_status", req.query.status] })
    .findAll({
      include: ["user","driver"]
    });
    const doctors = await req.db.employee.findAll({
      where: {
        role: "doctor",
        status: "active",
      }
    });
  const orderStatusCounts = await req.db.order.findAll({
    attributes: [
      "status",
      [req.db.order.sequelize.fn("COUNT", "status"), "count"],
    ],
    group: ["status"],
  });
  console.log(orderStatusCounts);
  const total_count = orderStatusCounts.reduce((result, orderObject) => {
    const { status, count } = orderObject.dataValues;
    result[status] = count;
    return result;
  }, {});
  console.log(total_count);
  const doctor = doctors[0];
  let result = orders.map(item => ({...item,doctor: doctor }));
  console.log('----------result---------');
  console.log(result);
  res.status(200).json({
    success: true,
    orders,
    total_count,
  });
});

exports.getMyOrders = asyncHandler(async (req, res, next) => {
  console.log(req.current_user);
  const role = {
    driver: "driver_id",
    superadmin: "user_id",
    customer: "user_id",
  };

  // Use role name as a string when accessing the property
  console.log(role[req.current_user.role]);
  const orders = await req.db.order
    .scope({ method: ["filter_by_status", req.query.status] })
    .findAll({
      where: {
        [role[req.current_user.role]]: req.current_user.id,
      },
      include: ["user", "driver","doctor"],
    });
  res.status(200).json({
    success: true,
    orders,
  });
});

exports.createOrder = asyncHandler(async (req, res, next) => {
  const drivers = await req.db.employee.findAll({
    where: {
      role: "driver",
      status: "active",
    },
    attributes: ["id", "latitude", "longitude"],
  });
  console.log(drivers);
  const doctors = await req.db.employee.findAll({
    where: {
      role: "doctor",
      status: "active",
    }
  });
  console.log(doctors);
  const user = await req.db.user.findOne({
    where: { phone: req.body.phone },
  });

  // const customerLatitude = req.body.customer_latitude;
  // const customerLongitude = req.body.customer_longitude;

  // console.log(drivers, customerLatitude, customerLongitude);

  // drivers.forEach((driver) => {
  //   driver.distance = driver.haversineDistanceBetweenPoints(
  //     driver.latitude,
  //     driver.longitude,
  //     customerLatitude,
  //     customerLongitude
  //   );
  // });

  // drivers.sort((a, b) => a.distance - b.distance);

  req.body.driver_id = drivers[0].id;
  req.body.user_id = user.id;
  req.body.doctor_id = doctors[0].id;
  const order = await req.db.order.create(req.body);
  // await drivers[0].update({ status: "going" });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await req.db.order.findByPk(req.params.id, {
    include: ["user", "driver"],
  });

  if (!order) {
    throw new MyError(`Not found`, 404);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getLocation = asyncHandler(async (req, res, next) => {
  const order = await req.db.order.findByPk(req.params.id, {
    attributes: ["customer_latitude", "customer_longitude"],
    include: [{ association: "driver", attributes: ["latitude", "longitude"] }],
  });

  if (!order) {
    throw new MyError(`Not found`, 404);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.updateOrder = asyncHandler(async (req, res, next) => {
  const order = await req.db.order.findByPk(req.params.id);

  if (!order) {
    throw new MyError(`Not found`, 404);
  }

  await order.update(req.body);

  res.status(200).json({
    success: true,
    message: order,
  });
});

exports.updateLocation = asyncHandler(async (req, res, next) => {
  const order = await req.db.order.findByPk(req.params.id, {
    include: ["driver", "user"],
  });

  if (!order) {
    throw new MyError(`Not found`, 404);
  }

  order.driver.latitude = req.body.latitude;
  order.driver.longitude = req.body.longitude;
  order.customer_latitude = req.body.customer_latitude;
  order.customer_longitude = req.body.customer_longitude;

  await order.driver.save();
  await order.save();
  await order.reload();

  res.status(200).json({
    success: true,
    message: order,
  });
});

exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await req.db.order.findByPk(req.params.id);

  if (!order) {
    throw new MyError(`Not found`, 404);
  }

  await order.destroy();

  res.status(200).json({
    success: true,
    message: "Амжилттай устгалаа",
  });
});
