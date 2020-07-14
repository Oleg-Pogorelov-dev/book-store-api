const Sequelize = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

const cors = require("cors");


 
const app = express();
app.use(cors());
const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.json());

const keys = 'dev-jwt';
localStorage.token = '';

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
 
app.set("view engine", "hbs");
 
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
  console.log(decoded)
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

app.get("/login", function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.render("login.hbs");
});

app.get("/registration", function(req, res){
  res.render("registration.hbs");
});
 
// добавление данных

app.post("/login", urlencodedParser, async function(req, res){
  const user = await User.findAll({where: {name: req.body.login}, raw: true})
  .then(data => data[0])

  if (user) {
    const passwordResult = bcrypt.compareSync(req.body.password, user.password)
    if (passwordResult){
      const token = jwt.sign({
        login: user.name,
        userId: user._id
      }, keys, {expiresIn: 60 * 60})

      localStorage.token = token;

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

app.post("/registration", urlencodedParser, async function(req, res){
  const newUser = await User.findAll({where: {name: req.body.name}, raw: true })
  .then(data => data.length)

  if (newUser){
    res.status(409).json({
      message: 'Данный логин уже используется.'
    })
  } else {
    const salt = bcrypt.genSaltSync(10)
    const login = req.body.name;
    const password = req.body.password;

    User.create({ name: login, password: bcrypt.hashSync(password, salt)})
    .then(()=>{
      res.status(201).json({
        login: login,
        password: bcrypt.hashSync(password, salt)
      })
    }).catch(err=>console.log(err));
  }
});

// получаем объект по id для редактирования
app.get("/edit/:id", function(req, res){
  const userid = req.params.id;
  User.findAll({where:{id: userid}, raw: true })
  .then(data=>{
    res.render("edit.hbs", {
      user: data[0]
    });
  })
  .catch(err=>console.log(err));
});
 
// обновление данных в БД
app.post("/edit", urlencodedParser, function (req, res) {
         
  if(!req.body) return res.sendStatus(400);
 
  const username = req.body.name;
  const userage = req.body.age;
  const userid = req.body.id;
  User.update({name:username, age: userage}, {where: {id: userid} }).then(() => {
    res.redirect("/");
  })
  .catch(err=>console.log(err));
});

app.post("/logout", function (req, res) {
  localStorage.removeItem('token');
  res.redirect("/login");
});
 
// удаление данных
app.post("/delete/:id", function(req, res){  
  const userid = req.params.id;
  User.destroy({where: {id: userid} }).then(() => {
    res.redirect("/");
  }).catch(err=>console.log(err));
});