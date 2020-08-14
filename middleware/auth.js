const jwt = require("jsonwebtoken");
const { keyJwt } = require("../helpers/secretKeys");
const { v4: uuidv4 } = require("uuid");
const { User } = require("../db/db");

const createAccessToken = (user) => {
  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id,
    },
    keyJwt,
    { expiresIn: 60 * 60 }
  );

  console.log("USER", token);
  return token;
};

const createRefreshToken = async (user) => {
  const refresh_token = jwt.sign(
    {
      id: uuidv4(),
    },
    keyJwt,
    { expiresIn: 1000000 }
  );

  user.refresh_token = refresh_token;

  try {
    await user.save();
    return refresh_token;
  } catch {
    console.log("Database disconnected");
  }
};

const checkAccessToken = (req, res, next) => {
  try {
    const token = req.headers["access-token"];
    jwt.verify(token, keyJwt);
    next();
  } catch {
    res.status(401).json({
      error: new Error("Invalid request"),
    });
  }
};

const checkRefreshToken = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { refresh_token: req.headers["refresh-token"] },
    });

    const token = await createAccessToken(user);
    const refresh_token = await createRefreshToken(user);

    return res.status(201).json({
      token,
      refresh_token,
    });
  } catch {
    res.status(401).json({
      message: "Invalid Token",
    });
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  checkAccessToken,
  checkRefreshToken,
};
