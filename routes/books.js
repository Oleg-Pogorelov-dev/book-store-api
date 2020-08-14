const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");

const router = express.Router();
const DIR = "./public/";
const CustomError = require("../helpers/exceptions");
const db = require("../models");
const { Book } = db;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, uuidv4() + "-" + fileName);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

router.get("/", async function (req, res, next) {
  console.log("!!!!!!!!!!", req.query);
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
  console.log("RRRR", req);
  const url = req.protocol + "://" + req.get("host");
  try {
    if (!req.body.title) {
      return res.status(401).json({
        message: "Название не может быть пустым",
      });
    }

    const book = await Book.create({
      title: req.body.title,
      price: req.body.price,
      genre: req.body.genre,
      AuthorId: 1,
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

module.exports = router;
