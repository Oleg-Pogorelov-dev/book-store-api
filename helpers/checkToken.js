const keyJwt = 'dev-jwt';

const checkToken = async (res, decoded) => {
  try {
    decoded = await jwt.verify(req.headers['access-token'], keyJwt);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const user = await User.findOne({where: {refresh_token: req.headers['refresh-token']}, raw: true })
      if (user) {
        const token = jwt.sign({
          email: user.email,
          userId: user._id
        }, keyJwt, {expiresIn: 60 * 60})
        return res.status(201).json({
          user: user.email,
          token: token
        });
      } else {
        return res.status(401).json({
          message: error.message,
          user: ''
        })
      }
    }
  } 
}

module.exports = {
  checkToken
};