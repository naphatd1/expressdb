const bcryptjs = require("bcryptjs");
const models = require("../models/index");
const argon2 = require("argon2");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("../config/index");

exports.index = async (req, res, next) => {
  //   const users = await models.User.findAll();

  //   const users = await models.User.findAll({
  //     attributes: ["id", "name", "email"], //เลือก field
  //     order: [["id", "desc"]], //เรียงจากมากไปน้อย ใช้ array 2อัน
  //   });

  //   const users = await models.User.findAll({
  //     attributes: { exclude: ["password"] }, //ยกเว้น field
  //     order: [["id", "desc"]], //เรียงจากมากไปน้อย ใช้ array 2อัน
  //   });

  //   const users = await models.User.findAll({
  //     where: {
  //       email: "naphat1@gmail.com",
  //     },
  //     attributes: { exclude: ["password"] }, //ยกเว้น field
  //     order: [["id", "desc"]], //เรียงจากมากไปน้อย ใช้ array 2อัน
  //   });

  //   const users = await models.User.findAll({
  //     attributes: ["id", "name", ["email", "username"], "created_at"], //เปลี่ยนชื่อ field
  //     order: [["id", "desc"]], //เรียงจากมากไปน้อย ใช้ array 2อัน
  //   });

  const sql = "select id,name,email,created_at from users order by id desc";
  const users = await models.sequelize.query(sql, {
    type: models.sequelize.QueryTypes.SELECT,
  });

  res.status(200).json({ data: users });
};

exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await models.User.findByPk(id, {
      attributes: ["id", "name", "email"],
    });
    if (!users) {
      const error = new Error("Not User");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      data: users,
    });
  } catch (error) {
    res.status(error.statusCode).json({
      error: {
        message: error.message,
      },
    });
  }
};

exports.insert = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("ข้อมูลที่รับมาไม่ถูกต้อง");
      error.statusCode = 422;
      error.validation = errors.array();
      throw error;
    }

    // check email
    const existEmail = await models.User.findOne({ where: { email: email } });
    if (existEmail) {
      const error = new Error("User Already");
      error.statusCode = 400;
      throw error;
    }

    //hash bcryptjs
    // const salt = await bcryptjs.genSalt(8);
    // const passwordHash = await bcryptjs.hash(password, salt);

    // argon2
    const hashPass = await argon2.hash(password);

    //insert data
    const users = await models.User.create({
      name,
      email,
      password: hashPass,
    });
    res.status(201).json({
      message: "add data success",
      data: {
        id: users.id,
        email: users.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id, name, email, password } = req.body;
    if (req.params.id !== id) {
      const error = new Error("รหัสผู้ใช้ไม่ถูกต้อง");
      error.statusCode = 400;
      throw error;
    }

    // argon2 encrypt password
    const hashPass = await argon2.hash(password);

    //insert data
    const users = await models.User.update(
      {
        name,
        email,
        password: hashPass,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.status(201).json({
      message: "edit data success",
    });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const users = await models.User.findByPk(id);
    if (!users) {
      const error = new Error("Not User");
      error.statusCode = 404;
      throw error;
    }

    //delete user by id
    await models.User.destroy({
      where: {
        id: id,
      },
    });

    res.status(201).json({
      message: "delete data success",
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { id, email, password } = req.body;
    const existEmail = await models.User.findOne({ where: { email: email } });
    if (!existEmail) {
      const error = new Error("ไม่พบผู้ใช้งานในระบบ");
      error.statusCode = 404;
      throw error;
    }

    const checkPass = await models.User.findOne({ where: { email: email } });
    const verifyPass = await argon2.verify(checkPass.password, password);
    if (!verifyPass) {
      const error = new Error("รหัสผ่านไม่ถูกต้อง");
      error.statusCode = 401;
      throw error;
    }

    //jwt
    const checkJWT = await models.User.findOne({ where: { email: email } });
    const token = await jwt.sign(
      {
        id: checkJWT.id,
        email: checkJWT.email,
      },
      config.JWT_SECRET,
      { expiresIn: "5 days" }
    );
    //decode jwt
    const expires_in = jwt.decode(token);

    res.status(201).json({
      access_toker: token,
      expires_in: expires_in.exp,
      token_type: "Bearer",
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  const { id, email, name } = req.users;
  // const users = await models.User.findByPk(id, {
  //   attributes: ["id", "name", "email"],
  // });
  return res.status(200).json({
      user: req.users
  });
}
