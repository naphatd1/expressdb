const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userController");
const passportJWT = require("../middleware/passportJWT");

router.get("/", [passportJWT.isLogin], userController.index);
router.get("/:id", [passportJWT.isLogin], userController.show);
router.get("/", userController.me);
router.post("/login", userController.login);
router.post(
  "/",
  [
    body("name").not().isEmpty().withMessage("กรุณาป้อนข้อมูลชื่อสกุลด้วย"),
    body("email")
      .not()
      .isEmpty()
      .withMessage("กรุณากรอกอีเมล์ด้วย")
      .isEmail()
      .withMessage("รูปแบบอีเมล์ไม่ถูกต้อง"),
    body("password")
      .not()
      .isEmpty()
      .withMessage("กรุณากรอกรหัสผ่านด้วย")
      .isLength({ min: 3 })
      .withMessage("รหัสผ่านต้อง 3 ตัวอักษรขึ้นไป"),
  ],
  userController.insert
);
router.put("/:id", userController.update);
router.delete("/:id", userController.destroy);

module.exports = router;
