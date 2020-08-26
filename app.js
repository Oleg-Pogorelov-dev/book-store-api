const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

const auth = require("./routes/auth");
const books = require("./routes/books");
const authors = require("./routes/authors");
const orders = require("./routes/orders");

process.on("unhandledRejection", (reason, promise) => {
  console.log(reason);
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/", auth);
app.use("/books", books);
app.use("/authors", authors);
app.use("/orders", orders);
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).json({ message: err.message });
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
