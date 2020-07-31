const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const DIR = "./public/";
const { Book } = require("../db/db");
const { keyJwt } = require("../helpers/secretKeys");
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

router.get("/", async function (req, res) {
  let decoded;
  try {
    decoded = await jwt.verify(req.headers["access-token"], keyJwt);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const user = await User.findOne({
        where: { refresh_token: req.headers["refresh-token"] },
        raw: true,
      });
      if (user) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id,
          },
          keyJwt,
          { expiresIn: 60 * 60 }
        );
        res.status(201).json({
          user: user.email,
          token: token,
        });
      } else {
        res.status(401).json({
          message: error.message,
          user: "",
        });
      }
    }
  }

  if (decoded) {
    await Book.findAll()
      .then((data) => {
        res.status(200).json({
          books: data,
        });
      })
      .catch((err) => console.log(err));
  } else {
    res.status(404).json({
      message: "Ошибка аутентификации.",
    });
  }
});

router.post("/add_book", upload.single("img"), async function (req, res) {
  const url = req.protocol + "://" + req.get("host");
  if (!req.body.title) {
    res.status(401).json({
      message: "Название не может быть пустым",
    });
  } else {
    await Book.create({
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
