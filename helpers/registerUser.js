const registerUser = async (email, password) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const email = email;
    const password = password;

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
    throw { message: `Создание пользователя не удалось: ${e.message}` };
  }
};

module.exports = {
  registerUser,
};
