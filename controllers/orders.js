const db = require("../models");
const { Order, BookOrder, Book } = db;

async function orders(req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.query.id },
    });
    return res.status(200).json({
      orders,
    });
  } catch (e) {
    next(e);
  }
}

async function create_order(req, res, next) {
  try {
    const savedOrder = await Order.create({ userId: req.body.id });

    req.body.books.forEach(async (item) => {
      const book = await Book.findOne({ where: { id: item.id } });

      if (!book) {
        return res.status(404).json({
          message: "Книга не найдена.",
        });
      }

      const order = {
        orderId: savedOrder.id,
        bookId: item.id,
      };

      await BookOrder.create(order);
    });

    return res.status(201).json({
      message: `Заказ №${savedOrder.id} успешно совершен.`,
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  orders,
  create_order,
};
