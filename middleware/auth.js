const jwt = require("jsonwebtoken");
const { keyJwt } = require("../helpers/secretKeys");

module.exports = (req, res, next) => {
  try {
    const token = req.headers["access-token"];
    const decodedToken = jwt.verify(token, keyJwt);
    next();
  } catch {
    res.status(401).json({
      error: new Error("Invalid request"),
    });
  }
};

let decoded;
try {
  decoded = await jwt.verify(req.headers["access-token"], keyJwt);
} catch (error) {
  if (error.name === "TokenExpiredError") {
    const user = await User.findOne({
      where: { refresh_token: req.headers["refresh-token"] },
      raw: true,
    });
    if (user) {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id,
        },
        keyJwt,
        { expiresIn: 60 * 60 }
      );
      res.status(201).json({
        user: user.email,
        token: token,
      });
    } else {
      res.status(401).json({
        message: error.message,
        user: "",
      });
    }
  }
}
