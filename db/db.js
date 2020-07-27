const Sequelize = require('sequelize')
const UserModel = require('../models/User')

const sequelize = new Sequelize('book_store', 'oleg', '12345678', {
    dialect: "postgres",
    host: "localhost",
    define: {
      timestamps: false
    }
});

const User = UserModel(sequelize, Sequelize)

sequelize.sync()
  .then(() => {
    console.log(`Database & tables created!`)
  })

module.exports = {
  User
}