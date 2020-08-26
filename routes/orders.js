const express = require("express");

const router = express.Router();

const { isAuth } = require("../middleware/auth");
const { create_order, orders } = require("../controllers/orders");

router.get("/orders", isAuth, orders);
router.post("/create_order", create_order);

module.exports = router;
