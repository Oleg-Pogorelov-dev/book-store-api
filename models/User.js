const Sequelize = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});


'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  User.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
  }, {
    sequelize,
    timestamps: true,
    modelName: 'user',
  });
  return User;
};