const express = require("express");

const router = express.Router();

const CustomError = require("../helpers/exceptions");
const db = require("../models");
const { Author } = db;

router.post("/add_author", async function (req, res, next) {
  try {
    if (!req.body.name) {
      return res.status(401).json({
        message: "Название не может быть пустым",
      });
    }

    const author = await Author.create({
      name: req.body.name,
      text: req.body.text,
    });
    return res.status(201).json({
      message: `Автор ${author.name} успешно добавлен.`,
    });
  } catch (e) {
    next(new CustomError(e.message, 500));
  }
});

module.exports = router;
