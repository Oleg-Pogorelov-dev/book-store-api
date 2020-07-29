const Sequelize = require('sequelize')
const UserModel = require('../models/User')
const BookModel = require('../models/Book')

const sequelize = new Sequelize('book_store', 'oleg', '12345678', {
    dialect: "postgres",
    host: "localhost",
    define: {
      timestamps: false
    }
});

const User = UserModel(sequelize, Sequelize)
const Book = BookModel(sequelize, Sequelize)

sequelize.sync()
  .then(() => {
    console.log(`Database & tables created!`)
  })

module.exports = {
  User,
  Book
}