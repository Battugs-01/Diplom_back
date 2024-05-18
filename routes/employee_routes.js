const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/protect");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDrivers,
  getDoctors,
} = require("../controller/employee_controller");

router.use(auth);

// CRUD
router.route("/").get(getEmployees).post(createEmployee);
router.route("/drivers").get(getDrivers);
router.route("/doctors").get(getDoctors);

router
  .route("/:id")
  .get(getEmployee)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
