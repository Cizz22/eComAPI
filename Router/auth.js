const router = require("express").Router();
const User = require("../Model/User");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

//Register
router.post(
  "/register",
  async ({ body: { username, email, password } }, res) => {
    const newUser = new User({
      username,
      email,
      password: cryptoJs.AES.encrypt(
        password,
        process.env.SECRET_PASS
      ).toString(),
    });

    try {
      const savedUser = await newUser.save();

      const {password:pass, ...data} = savedUser._doc
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({
        message: "Something error",
        error,
      });
    }
  }
);

//Login
router.post("/login", async ({ body: { username, password } }, res) => {
  try {
    const user = await User.findOne({ username });
    !user &&
      res.status(401).json({
        message: "Somethings wrong, try login again",
      });
    const hashPass = cryptoJs.AES.decrypt(
      user.password,
      process.env.SECRET_PASS
    ).toString(cryptoJs.enc.Utf8);
    hashPass !== password &&
      res.status(401).json({
        message: "Somethings wrong, try login again",
      });

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_PASS,
      { expiresIn: "3d" }
    );

    const { password: pass, ...data } = user._doc;

    res.status(200).json({
      message: "Login Berhasil!",
      data: { ...data, accessToken },
    });
  } catch (error) {}
});

module.exports = router;
