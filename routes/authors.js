const express = require("express");
const router = express.Router();

const { upload } = require("../middleware/multer");
const {
  author,
  add_author,
  search_authors,
} = require("../controllers/authors");

router.get("/author", author);
router.post("/add_author", upload.single("img"), add_author);
router.get("/search_authors", search_authors);

module.exports = router;
