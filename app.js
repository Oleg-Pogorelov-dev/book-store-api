const Sequelize = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const passport = require('passport');
 
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});

const keys = 'dev-jwt';

app.use(passport.initialize());
// require('./middleware/passport')(passport)

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


const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys
}

function passportT(passport) {
    passport.use(
        new JwtStrategy(options, async (payload, done) => {
          const user = await User.findAll({where: {id: payload.userId}, raw: true})
          .then(data => {
            return {
              id: data.id,
              login: data.name
            }
          })

          if (user) {
            done(null, user)
          } else {
            done(null, false)
          }
        })
    )
}

// получение данных
app.get("/", passportT.authenticate('jwt', {session: false}), function(req, res){
    User.findAll({raw: true }).then(data=>{
      res.render("index.hbs", {
        users: data
      });
    }).catch(err=>console.log(err));
});

app.get("/login", function(req, res){
  res.render("login.hbs");
});

app.get("/registration", function(req, res){
  res.render("registration.hbs");
});
 
app.get("/create", function(req, res){
    res.render("create.hbs");
});
 
// добавление данных
app.post("/create", urlencodedParser, function (req, res) {
         
    if(!req.body) return res.sendStatus(400);
         
    const username = req.body.name;
    const userage = req.body.age;
    User.create({ name: username, age: userage}).then(()=>{
      res.redirect("/");
    }).catch(err=>console.log(err));
});

app.post("/login", urlencodedParser, async function(req, res){
  const user = await User.findAll({where: {name: req.body.name}, raw: true})
  .then(data => data[0])

  if (user) {
    const passwordResult = bcrypt.compareSync(req.body.password, user.password)
    if (passwordResult){
      const token = jwt.sign({
        login: user.name,
        userId: user._id
      }, keys, {expiresIn: 60 * 60})

      res.status(200).json({
        token: `Bearer ${token}`
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
 
// удаление данных
app.post("/delete/:id", function(req, res){  
  const userid = req.params.id;
  User.destroy({where: {id: userid} }).then(() => {
    res.redirect("/");
  }).catch(err=>console.log(err));
});