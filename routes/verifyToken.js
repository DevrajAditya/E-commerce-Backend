const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json("Token is not Valid!");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not Authenticated!");
  }
};

// const isAuth=(req, res, next)=>{
//   const authorization = req.headers.token;
//   if(!authorization) return res.status(400).json("pass the token")
//   const token = authorization.split(' ')[1];
//   jwt.verify(token, process.env.JWT_SEC ,(err,decode)=>{
//       if(err) return res.json({err, msg: "Please login again"})
//       req.userId= decode
//       next();
//   })
// }
const verifyTokenAndAuthentication = (req, res, next) => {
  verifyToken(req, res, () => {
    console.log(req.user)
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not Allow to do That! ");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
      console.log(req.user)
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not Allow to do That! ");
      }
    });
  };

module.exports = { verifyToken, verifyTokenAndAuthentication, verifyTokenAndAdmin };
