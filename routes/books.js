const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const DIR = "./public/";
const { Book } = require("../db/db");
const { keyJwt } = require("../helpers/secretKeys");
const { checkAccessToken } = require("../middleware/auth");
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

router.get("/", checkAccessToken, async function (req, res) {
  console.log(req.query);
  Book.findAll({ limit: 2, offset: +req.query.offset })
    .then((data) => {
      res.status(200).json({
        books: data,
      });
    })
    .catch((err) => console.log(err));
});

router.post("/add_book", upload.single("img"), async function (req, res) {
  const url = req.protocol + "://" + req.get("host");
  if (!req.body.title) {
    res.status(401).json({
      message: "Название не может быть пустым",
    });
  } else {
    Book.create({
      title: req.body.title,
      img: url + "/" + req.file.filename,
    })

      .then((data) => {
        res.status(200).json({
          message: `Книга ${data.title} успешно добавлена.`,
        });
      })
      .catch((err) => console.log(err));
  }
});

module.exports = router;
