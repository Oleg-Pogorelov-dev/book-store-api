const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require("cors");

const { User } = require('../db/db')

const router = express.Router();
router.use(cors());

const keys = 'dev-jwt';

// router.get("/", function(req, res){
//   let decoded;
//   try {
//     decoded = jwt.verify(req.headers['access-token'], keys).email;
//   } catch {
//     decoded = null;
//   }
//   if(decoded){
//     User.findAll({raw: true }).then(data=>{
//       res.status(200).json({
//         users: data
//       });
//     }).catch(err=>console.log(err));
//   } else {
//     res.status(404).json({
//       message: 'Ошибка аутентификации.'
//     });
//   }
// });
  
router.post("/login", async function(req, res){
  const user = await User.findAll({where: {email: req.body.email}, raw: true})
  .then(data => data[0])

  if (user && req.body.email) {
    const passwordResult = bcrypt.compareSync(req.body.password, user.password)
    if (passwordResult){
      const token = jwt.sign({
        email: user.email,
        userId: user._id
      }, keys, {expiresIn: 60 * 60})

      res.status(200).json({
        token: token
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
    const user = await User.create({ email: email, password: bcrypt.hashSync(password, salt)})
    .catch(err=>console.log(err));
    const token = jwt.sign({
      email: user.email,
      userId: user._id
    }, keys, {expiresIn: 60 * 60})

    res.status(201).json({
      token : token,
      email: email,
      password: bcrypt.hashSync(password, salt)
    })
  }
});


router.get("/profile", async function(req, res){
  let decoded;
  try {
    decoded = await jwt.verify(req.headers['access-token'], keys);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        message: error.message,
        user: {
          email: ''
        }
      })
    }
  } 
  
  if(decoded){
    User.findOne({where: {email: decoded.email}}).then(data=>{
      res.status(200).json({
        user: data
      });
    }).catch(err=>console.log(err));
  } else {
    res.status(404).json({
      message: 'Ошибка аутентификации.'
    });
  }
});
   
module.exports = router;