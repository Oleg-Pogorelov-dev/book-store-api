const Sequelize = require("sequelize");

const db = require("../models");
const { Book, Author } = db;

const DEFAULT_SEARCH_LIMIT = 12;

async function books(req, res, next) {
  try {
    const filterOptinons = {
      ...(req.query.title
        ? {
            title: {
              [Sequelize.Op.iLike]: `%${req.query.title}%`,
            },
          }
        : {}),
      ...(req.query.genre
        ? {
            genre: req.query.genre,
          }
        : {}),
    };

    const books = await Book.findAndCountAll({
      where: filterOptinons,
      limit: req.query.booksLimit,
      offset: +req.query.offset,
      order: [[req.query.order_item, req.query.order_type]],
    });

    return res.status(200).json({
      books,
    });
  } catch (e) {
    next(e);
  }
}

async function book(req, res, next) {
  try {
    const book = await Book.findOne({ where: { id: +req.query.id } });

    if (!book) {
      return res.status(404).json({
        message: "Книга не найдена.",
      });
    }

    const author = await book.getAuthor();

    if (!author) {
      return res.status(404).json({
        message: "Автор не найден.",
      });
    }

    res.status(200).json({
      book,
      author: author.name,
    });
  } catch (e) {
    next(e);
  }
}

async function add_book(req, res, next) {
  const url = req.protocol + "://" + req.get("host");
  try {
    if (!req.body.title) {
      return res.status(401).json({
        message: "Название не может быть пустым",
      });
    }

    const author = await Author.findOne({ where: { name: req.body.name } });

    if (!author) {
      return res.status(404).json({
        message: "Автор не найден.",
      });
    }

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
    next(e);
  }
}

async function search_book(req, res, next) {
  try {
    const books = await Book.findAll({
      where: {
        title: {
          [Sequelize.Op.iLike]: `%${req.query.search}%`,
        },
      },
      limit: DEFAULT_SEARCH_LIMIT,
    });

    return res.status(200).json({
      books: books,
    });
  } catch (e) {
    next(e);
  }
}

async function update_book(req, res, next) {
  try {
    const author = await Author.findOne({ where: { name: req.body.author } });

    if (!author) {
      return res.status(404).json({
        message: "Автор не найден.",
      });
    }

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
}

async function delete_book(req, res, next) {
  try {
    const book = await Book.findOne({ where: { id: req.query.id } });

    if (!book) {
      return res.status(404).json({
        message: "Книга не найдена.",
      });
    }

    await book.destroy();

    return res.status(202).json({
      message: "Книга успешно удалена",
    });
  } catch (e) {
    res.status(409).json({
      message: e,
    });
  }
}

module.exports = {
  books,
  book,
  add_book,
  search_book,
  update_book,
  delete_book,
};
