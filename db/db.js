const Sequelize = require("sequelize");
const UserModel = require("../models/User");
const BookModel = require("../models/Book");
const OrderModel = require("../models/Order");
const AuthorModel = require("../models/Author");

const sequelize = new Sequelize("book_store", "oleg", "12345678", {
  dialect: "postgres",
  host: "localhost",
});

const User = UserModel(sequelize, Sequelize);
const Book = BookModel(sequelize, Sequelize);
const Order = OrderModel(sequelize, Sequelize);
const Author = AuthorModel(sequelize, Sequelize);

Author.hasMany(Book);
Book.belongsTo(Author);

sequelize.sync().then(() => {
  console.log(`Database & tables created!`);
});

module.exports = {
  User,
  Book,
  Order,
  Author,
};
