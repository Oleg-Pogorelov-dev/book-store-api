const express = require("express");

const router = express.Router();

const { checkAccessToken } = require("../middleware/auth");
const CustomError = require("../helpers/exceptions");
const db = require("../models");
const { Order, BookOrder, Book } = db;

router.get("/orders", checkAccessToken, async function (req, res, next) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.query.id },
    });
    return res.status(200).json({
      orders,
    });
  } catch (e) {
    throw new CustomError(e.original.message, 401);
  }
});

router.post("/create_order", async function (req, res, next) {
  const savedOrder = await Order.create({ userId: req.body.id });

  req.body.books.forEach(async (item) => {
    const book = await Book.findOne({ where: { id: item.id } });

    if (!book) {
      return res.status(400);
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
});

module.exports = router;
