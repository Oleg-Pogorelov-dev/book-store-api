const Sequelize = require("sequelize");

const db = require("../models");
const { Author } = db;

async function author(req, res, next) {
  try {
    if (!+req.query.id) {
      return res.status(404).json({
        message: "Автор не найден.",
      });
    }

    const author = await Author.findOne({ where: { id: +req.query.id } });

    if (!author) {
      return res.status(404).json({
        message: "Автор не найден.",
      });
    }

    res.status(200).json({
      author,
    });
  } catch (e) {
    next(e);
  }
}

async function add_author(req, res, next) {
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
    next(e);
  }
}

async function search_authors(req, res, next) {
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
    next(e);
  }
}

module.exports = {
  author,
  add_author,
  search_authors,
};
