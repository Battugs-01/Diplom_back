const express = require("express");
const router = express.Router();

const { authorize } = require("../middleware/protect");
const { auth } = require("../middleware/authMiddleware");
const {
  getUsers,
  getUser,
  createUser,
  getMe
} = require("../controller/user_controller");
router.route('/me').get(getMe);

router.use(auth);

// CRUD
router.route("/").get(getUsers).post(createUser);
router.route("/:id").get(getUser);

module.exports = router;
