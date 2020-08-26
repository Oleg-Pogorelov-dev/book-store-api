const express = require("express");
const router = express.Router();

const { upload } = require("../middleware/multer");
const { isAuth, checkAndCreateRefreshToken } = require("../middleware/auth");

const {
  login,
  registration,
  profile,
  update_avatar,
  update_info,
} = require("../controllers/auth");

router.post("/login", login);
router.post("/registration", registration);
router.get("/profile", isAuth, profile);
router.put("/update_avatar", upload.single("avatar"), update_avatar);
router.put("/update_info", update_info);
router.post("/refresh_token", checkAndCreateRefreshToken);

module.exports = router;
