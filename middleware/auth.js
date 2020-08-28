const jwt = require("jsonwebtoken");
const keyJwt = require("../config/config.json").secretKey;
const { User } = require("../db/db");
const { createToken } = require("../utils/auth");

const isAuth = (req, res, next) => {
  try {
    console.log("SESESES", req.headers["authorization"].split(" ")[1]);
    const token = req.headers["authorization"].split(" ")[1];
    const email = jwt.verify(token, keyJwt).email;
    req.body.email = email;
    console.log("!!!!", token);
    next();
  } catch (e) {
    res.status(401).json({
      message: "Token expired",
    });
  }
};

const checkAndCreateRefreshToken = async (req, res, next) => {
  try {
    const refresh_token = req.body.refresh_token;
    jwt.verify(refresh_token, keyJwt);

    const user = await User.findOne({
      where: { refresh_token },
    });

    const token = createToken(user, 60 * 15);
    const new_refresh_token = createToken(user, 60 * 60 * 72);

    user.refresh_token = new_refresh_token;
    await user.save();

    return res.status(201).json({
      token,
      refresh_token: new_refresh_token,
    });
  } catch {
    res.status(401).json({
      message: "Invalid Token",
    });
  }
};

module.exports = {
  isAuth,
  checkAndCreateRefreshToken,
};
