const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require("cors");

const { Book } = require('../db/db');
const { checkToken } = require('../helpers/checkToken');
const { keyJwt } = require('../helpers/secretKeys');

const router = express.Router();
router.use(cors());

router.get("/", async function(req, res){
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
    await Book.findAll().then(data=>{
      res.status(200).json({
        books: data
      });
    }).catch(err=>console.log(err));
  } else {
    res.status(404).json({
      message: 'Ошибка аутентификации.'
    });
  }
});

router.post("/add_book", async function(req, res){
  if (!req.body.title){
    res.status(401).json({
      message: 'Название не может быть пустым'
    })
  } else {
    await Book.create({ 
      title: req.body.title
    })
    .then(data=>{
      res.status(200).json({
        message: `Книга ${data.title} успешно добавлена.`
      })
    })
    .catch(err=>console.log(err));
  }
});
  
module.exports = router;
