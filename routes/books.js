const express = require("express");
const { upload } = require("../middleware/multer");

const router = express.Router();
const {
  books,
  book,
  add_book,
  search_book,
  update_book,
  delete_book,
} = require("../controllers/books");

router.get("/", books);
router.get("/book", book);
router.post("/add_book", upload.array("img"), add_book);
router.get("/search_book", search_book);
router.put("/update_book", update_book);
router.delete("/delete_book", delete_book);

module.exports = router;
