const Sequelize = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const cors = require("cors");


 
const app = express();
app.use(cors());
app.use(bodyParser.json());

const keys = 'dev-jwt';

// определяем объект Sequelize
const sequelize = new Sequelize('book_store', 'oleg', '12345678', {
  dialect: "postgres",
  host: "localhost",
  define: {
    timestamps: false
  }
});
 
// определяем модель User
const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// синхронизация с бд, после успшной синхронизации запускаем сервер
sequelize.sync().then(()=>{
  app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
  });
}).catch(err=>console.log(err));

// получение данных
app.get("/", function(req, res){
  let decoded;
  try {
    decoded = jwt.verify(req.headers['access-token'], keys).login;
  } catch {
    decoded = null;
  }
  if(decoded){
    User.findAll({raw: true }).then(data=>{
      res.status(200).json({
        users: data
      });
    }).catch(err=>console.log(err));
  } else {
    res.status(404).json({
      message: 'Ошибка аутентификации.'
    });
  }
});
 
// добавление данных

app.post("/login", async function(req, res){
  const user = await User.findAll({where: {name: req.body.login}, raw: true})
  .then(data => data[0])

  if (user) {
    const passwordResult = bcrypt.compareSync(req.body.password, user.password)
    if (passwordResult){
      const token = jwt.sign({
        login: user.name,
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

app.post("/registration", async function(req, res){
  console.log(req)
  const candidate = await User.findOne({where: {name: req.body.email}, raw: true })
  .then(data => data)

  if (candidate){
    res.status(409).json({
      message: 'Данный логин уже используется.'
    })
  } else {
    const salt = bcrypt.genSaltSync(10)
    const login = req.body.email;
    const password = req.body.password;
    const user = await User.create({ name: login, password: bcrypt.hashSync(password, salt)})
    .catch(err=>console.log(err));
    console.log('user', user)
    const token = jwt.sign({
      login: user.name,
      userId: user._id
    }, keys, {expiresIn: 60 * 60})

    res.status(201).json({
      token : token,
      login: login,
      password: bcrypt.hashSync(password, salt)
    })
  }
});


app.get("/profile", async function(req, res){
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
    User.findOne({where: {name: decoded.login}}).then(data=>{
      console.log(decoded)
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
 