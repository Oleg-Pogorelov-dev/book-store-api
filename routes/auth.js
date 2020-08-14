const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const db = require("../models");
const { User, Order, Book, BookOrder } = db;
const { keyJwt } = require("../helpers/secretKeys");
const {
  checkAccessToken,
  checkRefreshToken,
  createAccessToken,
  createRefreshToken,
} = require("../middleware/auth");
const registerUser = require("../helpers/registerUser");
const CustomError = require("../helpers/exceptions");
// const Order = require("../models/Order");
// const BookOrder = require("../models/BookOrder");

router.post("/login", async function (req, res, next) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    const passwordResult = bcrypt.compareSync(req.body.password, user.password);
    if (passwordResult) {
      const token = createAccessToken(user);
      const refresh_token = await createRefreshToken(user);

      return res.status(200).json({
        token,
        refresh_token,
      });
    }

    return res.status(401).json({
      message: "Неверный пароль.",
    });
  } catch {
    res.status(404).json({
      message: "Пользователь не найден.",
    });
  }
});

router.post("/registration", async function (req, res, next) {
  try {
    const candidate = await User.findOne({
      where: { email: req.body.email },
      raw: true,
    });

    if (candidate) {
      return res.status(409).json({
        message: "Данный логин уже используется.",
      });
    }

    if (req.body.password.length < 8) {
      return res.status(409).json({
        message: "Пароль должен быть не меньше 8 символов.",
      });
    }

    await registerUser(req.body.email, req.body.password);
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }
});

router.get("/profile", checkAccessToken, async function (req, res, next) {
  try {
    const user = await User.findOne({
      where: { email: jwt.verify(req.headers["access-token"], keyJwt).email },
    });

    const orders = await Order.findAll({
      include: [
        {
          model: Book,
          as: "books",
          attributes: ["id", "title", "price", "genre"],
        },
      ],
    });

    return res.status(200).json({
      user,
      orders,
    });
  } catch (e) {
    throw new CustomError(e.original.message, 401);
  }
});

router.get("/refresh_token", checkRefreshToken);

module.exports = router;
