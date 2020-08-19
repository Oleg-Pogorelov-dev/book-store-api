"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Book.belongsTo(models.Author, { foreignKey: "AuthorId" });
      Book.belongsToMany(models.Order, {
        through: "BookOrder",
        as: "orders",
        foreignKey: "bookId",
        otherKey: "orderId",
      });
    }
  }
  Book.init(
    {
      title: DataTypes.STRING,
      img: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: ["download.png"],
      },
      AuthorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      genre: DataTypes.STRING,
      price: DataTypes.INTEGER,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Book",
    }
  );
  return Book;
};
