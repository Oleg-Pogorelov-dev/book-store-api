const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

process.on("unhandledRejection", (reason, promise) => {
  console.log("");
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/", require("./routes/auth"));
app.use("/books", require("./routes/books"));
app.use("/authors", require("./routes/authors"));
app.use("/orders", require("./routes/orders"));
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).json({ message: err.message });
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
