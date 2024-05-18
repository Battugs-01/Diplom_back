require("dotenv").config();
const express = require("express");
var fs = require("fs");
var path = require("path");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cors = require("cors");
const errorHandler = require("./middleware/error");

const helmet = require("helmet");
const userRoutes = require("./routes/user_routes");
const employeeRoutes = require("./routes/employee_routes");
const orderRoutes = require("./routes/order_routes");
const hospitalRoutes = require("./routes/hospital_routes");
const loginRoutes = require("./routes/login_routes");
const registerRoutes = require("./routes/register_routes");

const injectDb = require("./middleware/injectDb");
const cron = require('node-cron');
const db = require("./db-mysql");

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(fileupload());
app.use(injectDb(db));
app.use("/hospital", hospitalRoutes);
app.use("/orders", orderRoutes);
app.use("/employees", employeeRoutes);
app.use("/users", userRoutes);
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use(errorHandler);

// db.product.belongsTo(db.category, {
//   foreignKey: "categoryID",
//   as: "Category",
// });
// db.category.hasMany(db.product, {
//   as: "Products",
//   foreignKey: "categoryID",
// });

db.order.belongsTo(db.user, {
  foreignKey: "user_id",
  as: "user",
});
db.user.hasMany(db.order, {
  foreignKey: "user_id",
  as: "orders",
});

db.employee.hasMany(db.order, {
  foreignKey: "driver_id",
  as: "orders",
});
db.order.belongsTo(db.employee, {
  foreignKey: "driver_id",
  as: "driver",
});

db.employee.belongsTo(db.hospital, {
  foreignKey: "hospital_id",
  as: "hospital",
});
db.hospital.hasMany(db.employee, {
  foreignKey: "hospital_id",
  as: "employees",
});

// db.category.belongsTo(db.hospital, {
//   foreignKey: "categoryID",
//   as: "Hospital",
// });
// db.hospital.hasMany(db.category, {
//   foreignKey: "categoryID",
//   as: "Categories",
// });

db.ssSequelize
  .sync()
  .then((result) => {
    console.log("MYSQL SCHEMA SYNC SUCCESSFUL...".blue);
  })
  .catch((err) => console.log(err));

const server = app.listen(
  process.env.PORT,
  console.log(`SERVER ${process.env.PORT} PORT ДЭЭР АСЛАА`.blue)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа: ${err.message}`.red.bold);
  server.close(() => {
    process.exit(1);
  });
});

// Function to update status from 'new' to 'going'
const updateStatus = () => {
  const query = `UPDATE orders SET status = 'going' WHERE status = 'new'`;
  db.ssSequelize.query(query, { type: db.ssSequelize.QueryTypes.UPDATE })
    .then(result => {
      console.log(`Updated ${result[1]} rows`);
    })
    .catch(err => {
      console.error('Error updating status:', err);
    });
};

// Schedule the updateStatus function to run every minute
cron.schedule('*/10 * * * * *', () => {
  console.log('Running updateStatus job');
  updateStatus();
});
