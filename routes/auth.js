const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const { User } = require('../db/db');

const router = express.Router();
router.use(cors());

const { keyJwt } = require('../helpers/secretKeys');
  
router.post("/login", async function(req, res){
  const user = await User.findOne({where: {email: req.body.email}})

  if (user && req.body.email) {
    const passwordResult = bcrypt.compareSync(req.body.password, user.password)
    if (passwordResult){
      const token = jwt.sign({
        email: user.email,
        userId: user._id
      }, keyJwt, {expiresIn: 60 * 60})
      const refresh_token = jwt.sign({
        id: uuidv4(),
      }, keyJwt, {expiresIn: 1000000})

      user.refresh_token = refresh_token;
      await user.save();

      res.status(200).json({
        token: token,
        refresh_token: refresh_token
      })
    } else {
      res.status(401).json({
        message: 'Неверный пароль.'
      })
    }
  } else {
    res.status(404).json({
      message: 'Пользователь не найден.'
    })
  }
});
  
router.post("/registration", async function(req, res){
  const candidate = await User.findOne({where: {email: req.body.email}, raw: true })
  .then(data => data)

  if (candidate){
    res.status(409).json({
      message: 'Данный логин уже используется.'
    })
  } else if (req.body.password.length < 8) {
    res.status(409).json({
      message: 'Пароль должен быть не меньше 8 символов.'
    })
  } else {
    const salt = bcrypt.genSaltSync(10)
    const email = req.body.email;
    const password = req.body.password;
    const refresh_token = jwt.sign({
      id: uuidv4(),
    }, keyJwt, {expiresIn: 1000000})

    const user = await User.create({ 
      email: email, 
      password: bcrypt.hashSync(password, salt),
      refresh_token: refresh_token
    })
    .catch(err=>console.log(err));

    const token = jwt.sign({
      email: user.email,
      userId: user._id
    }, keyJwt, {expiresIn: 60 * 60})

    res.status(201).json({
      token : token,
      refresh_token: refresh_token,
      email: email,
    })
  }
});


router.get("/profile", async function(req, res){
  let decoded;
  try {
    decoded = await jwt.verify(req.headers['access-token'], keyJwt);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      const user = await User.findOne({where: {refresh_token: req.headers['refresh-token']}, raw: true })
      if (user) {
        const token = jwt.sign({
          email: user.email,
          userId: user._id
        }, keyJwt, {expiresIn: 60 * 60})
        res.status(201).json({
          user: user.email,
          token: token
        });
      } else {
        res.status(401).json({
          message: error.message,
          user: ''
        })
      }
    }
  } 
  
  if(decoded){
    User.findOne({where: {email: decoded.email}}).then(data=>{
      res.status(200).json({
        user: data.email
      });
    }).catch(err=>console.log(err));
  } else {
    res.status(404).json({
      message: 'Ошибка аутентификации.'
    });
  }
});
   
module.exports = router;