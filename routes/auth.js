const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const { JsonWebTokenError } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

// Register User

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const saveUser = await newUser.save();
    res.status(201).json(saveUser);
  } catch (err) {
    console.log('==========>', err)
    res.status(500).json({err: err, msg: "User is already register, Try another username"});
  }
});

// Login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user)
    return res.status(401).json("User not found !");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    if (OriginalPassword !== req.body.password) {
      return res.status(401).json({error: "wrong credentails !"});
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin, 
      },
      process.env.JWT_SEC, {expiresIn:"3d"}
    );

    const { password, ...others } = user._doc;

    res.status(200).json({...others, accessToken});
  } catch (error) {
    res.status(500).json(error);
  }
});



module.exports = router;
