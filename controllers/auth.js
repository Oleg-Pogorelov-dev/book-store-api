const bcrypt = require("bcryptjs");

const db = require("../models");
const { User, Order, Book } = db;
const { createToken } = require("../utils/auth");

async function registerUser(email, password) {
  try {
    const salt = bcrypt.genSaltSync(10);

    const user = await User.create({
      email: email,
      password: bcrypt.hashSync(password, salt),
    });

    const refresh_token = createToken(user, 60 * 60 * 72);
    const token = createToken(user, 60 * 15);

    user.refresh_token = refresh_token;
    await user.save();

    res.status(201).json({
      token,
      refresh_token,
      email,
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден.",
      });
    }

    const passwordResult = bcrypt.compareSync(req.body.password, user.password);
    if (passwordResult) {
      const token = createToken(user, 60 * 15);
      const refresh_token = createToken(user, 60 * 60 * 72);

      user.refresh_token = refresh_token;
      await user.save();

      return res.status(200).json({
        token,
        refresh_token,
      });
    }

    return res.status(401).json({
      message: "Неверный пароль.",
    });
  } catch (e) {
    next(e);
  }
}

async function registration(req, res, next) {
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
    next(e);
  }
}

async function profile(req, res, next) {
  console.log("FDSFDF", req);
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден.",
      });
    }

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
    next(e);
  }
}

async function update_avatar(req, res, next) {
  try {
    await User.update(
      { avatar: req.file.filename },
      { where: { email: req.body.email } }
    );

    return res.status(202).json({
      message: "Аватар успешно изменен",
    });
  } catch (e) {
    next(e);
  }
}

async function update_info(req, res, next) {
  try {
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
    next(e);
  }
}

module.exports = {
  login,
  registration,
  profile,
  update_avatar,
  update_info,
};
