const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const { User } = require("../db/db");
const { keyJwt } = require("../helpers/secretKeys");
const {
  checkAccessToken,
  checkRefreshToken,
  createAccessToken,
  createRefreshToken,
} = require("../middleware/auth");

router.post("/login", async function (req, res) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    const passwordResult = bcrypt.compareSync(req.body.password, user.password);
    if (passwordResult) {
      const token = createAccessToken(user);
      const refresh_token = await createRefreshToken(user);

      res.status(200).json({
        token,
        refresh_token,
      });
    } else {
      res.status(401).json({
        message: "Неверный пароль.",
      });
    }
  } catch {
    res.status(404).json({
      message: "Пользователь не найден.",
    });
  }
});

router.post("/registration", async function (req, res) {
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
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.create({
      email: email,
      password: bcrypt.hashSync(password, salt),
    });

    const refresh_token = createRefreshToken(user);
    const token = createAccessToken(user);

    res.status(201).json({
      token,
      refresh_token,
      email,
    });
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }
});

router.get("/profile", checkAccessToken, async function (req, res) {
  User.findOne({
    where: { email: jwt.verify(req.headers["access-token"], keyJwt).email },
  })
    .then((data) => {
      res.status(200).json({
        user: data.email,
      });
    })
    .catch((err) => console.log(err));
});

router.get("/refresh_token", checkRefreshToken);

module.exports = router;
