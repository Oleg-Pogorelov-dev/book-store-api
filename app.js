const express = require("express");
const bodyParser = require("body-parser");
 
const app = express();
app.use(bodyParser.json());

app.use('/', require('./routes/auth'));
app.use('/books', require('./routes/books'));

app.listen(3000, function(){
  console.log("Сервер ожидает подключения...");
});
