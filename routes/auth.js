const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const { JsonWebTokenError } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
// const isAuth   = require('./verifyToken');

// const validateTokken = require('./verifyToken')

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
    res.status(500).json(err);
  }
});

// Login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("wrong credentails !");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    OriginalPassword !== req.body.password &&
      res.status(401).json("wrong credentails !");

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


// router.get('/validatetoken', isAuth.isAuth, (req, res)=>{
//    if(!req.userId)  res.status(400).json({token: false})
//       res.status(200).json({token: true})
// })

module.exports = router;
