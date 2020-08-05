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
    }
  }
  Book.init(
    {
      title: DataTypes.STRING,
      img: DataTypes.STRING,
      AuthorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
      },
      genre: DataTypes.STRING,
      price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Book",
    }
  );
  return Book;
};
