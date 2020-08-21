const express = require("express");
const Sequelize = require("sequelize");
const router = express.Router();

const { upload } = require("../helpers/multer");
const CustomError = require("../helpers/exceptions");
const db = require("../models");
const { Author } = db;

router.get("/author", async function (req, res, next) {
  try {
    const author = await Author.findOne({ where: { id: +req.query.id } });

    res.status(200).json({
      author,
    });
  } catch (e) {
    throw new CustomError(e.original.message, 500);
  }
});

router.post("/add_author", upload.single("img"), async function (
  req,
  res,
  next
) {
  try {
    if (!req.body.name) {
      return res.status(401).json({
        message: "Название не может быть пустым",
      });
    }

    const author = await Author.create({
      name: req.body.name,
      text: req.body.text,
      img: req.file.filename,
    });
    return res.status(201).json({
      message: `Автор ${author.name} успешно добавлен.`,
    });
  } catch (e) {
    next(new CustomError(e.message, 500));
  }
});

router.get("/search_authors", async function (req, res, next) {
  try {
    const authors = await Author.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: `%${req.query.search}%`,
        },
      },
      limit: 10,
    });

    return res.status(200).json({
      authors: authors,
    });
  } catch (e) {
    throw new CustomError(e.original.message, 500);
  }
});

module.exports = router;
