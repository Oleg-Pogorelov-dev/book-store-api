const jwt = require("jsonwebtoken");
const keyJwt = require("../config/config.json").secretKey;

const createToken = (user, expiresIn) => {
  try {
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
      },
      keyJwt,
      { expiresIn: expiresIn }
    );
    return token;
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createToken,
};
