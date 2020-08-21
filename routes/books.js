const express = require("express");
const { upload } = require("../helpers/multer");
const Sequelize = require("sequelize");

const router = express.Router();
const CustomError = require("../helpers/exceptions");
const db = require("../models");
const { Book, Author } = db;

router.get("/", async function (req, res, next) {
  try {
    if (req.query.title && req.query.genre) {
      const books = await Book.findAndCountAll({
        where: {
          title: {
            [Sequelize.Op.iLike]: `%${req.query.title}%`,
          },
          genre: req.query.genre,
        },
        limit: 9,
        offset: +req.query.offset,
        order: [[req.query.order_item, req.query.order_type]],
      });
      return res.status(200).json({
        books,
      });
    }

    if (req.query.title) {
      const books = await Book.findAndCountAll({
        where: {
          title: {
            [Sequelize.Op.iLike]: `%${req.query.title}%`,
          },
        },
        limit: 9,
        offset: +req.query.offset,
        order: [[req.query.order_item, req.query.order_type]],
      });
      return res.status(200).json({
        books,
      });
    }

    if (req.query.genre) {
      const books = await Book.findAndCountAll({
        where: {
          genre: req.query.genre,
        },
        limit: 9,
        offset: +req.query.offset,
        order: [[req.query.order_item, req.query.order_type]],
      });
      return res.status(200).json({
        books,
      });
    }

    const books = await Book.findAndCountAll({
      limit: 9,
      offset: +req.query.offset,
      order: [[req.query.order_item, req.query.order_type]],
    });
    return res.status(200).json({
      books,
    });
  } catch (e) {
    // console.log(e);
    // throw Error("Something was wrong");
    throw new CustomError(e.original.message, 500);
  }
});

router.get("/book", async function (req, res, next) {
  try {
    const book = await Book.findOne({ where: { id: +req.query.id } });
    const author = await book.getAuthor();
    res.status(200).json({
      book,
      author: author.name,
    });
  } catch (e) {
    throw new CustomError(e.original.message, 500);
  }
});

router.post("/add_book", upload.array("img"), async function (req, res, next) {
  const url = req.protocol + "://" + req.get("host");
  try {
    if (!req.body.title) {
      return res.status(401).json({
        message: "Название не может быть пустым",
      });
    }

    const author = await Author.findOne({ where: { name: req.body.name } });

    const book = await Book.create({
      title: req.body.title,
      price: req.body.price,
      genre: req.body.genre,
      description: req.body.description,
      AuthorId: author.id,
    });

    if (req.files.length) {
      const book_imgs = [];
      for (let i = 0; i < req.files.length; i++) {
        book_imgs.push(req.files[i].filename);
      }
      book.img = book_imgs;
      await book.save();
    }

    return res.status(201).json({
      message: `Книга ${book.title} успешно добавлена.`,
    });
  } catch (e) {
    throw new CustomError(e.message, 500);
  }
});

router.get("/search_book", async function (req, res, next) {
  try {
    const books = await Book.findAll({
      where: {
        title: {
          [Sequelize.Op.iLike]: `%${req.query.search}%`,
        },
      },
      limit: 10,
    });

    return res.status(200).json({
      books: books,
    });
  } catch (e) {
    throw new CustomError(e.original.message, 500);
  }
});

router.put("/update_book", async function (req, res, next) {
  try {
    const author = await Author.findOne({ where: { name: req.body.author } });
    await Book.update(
      {
        title: req.body.title,
        genre: req.body.genre,
        price: +req.body.price,
        description: req.body.description,
        AuthorId: author.id,
      },
      { where: { id: req.body.id } }
    );

    return res.status(202).json({
      message: "Информация успешно изменена",
    });
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }
});

router.delete("/delete_book", async function (req, res, next) {
  try {
    const book = await Book.findOne({ where: { id: req.query.id } });

    await book.destroy();

    return res.status(202).json({
      message: "Книга успешно удалена",
    });
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }
});

module.exports = router;
