const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const DIR = "./public/";

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

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

router.put("/update_avatar", upload.single("avatar"), async function (
  req,
  res,
  next
) {
  try {
    await User.update(
      { avatar: req.file.filename },
      { where: { email: req.body.email } }
    );

    return res.status(202).json({
      message: "Аватар успешно изменен",
    });
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }
});

router.put("/update_info", async function (req, res, next) {
  try {
    console.log("USER", req);
    await User.update(
      {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: +req.body.phone,
      },
      { where: { email: req.body.email } }
    );

    return res.status(202).json({
      message: "Информация успешно изменена",
    });
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }
});

router.get("/refresh_token", checkRefreshToken);

module.exports = router;
