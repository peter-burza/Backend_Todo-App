import jwt from "jsonwebtoken"

function authMiddleware(req, res, next) {
  // This authorization we specify in the frontend (this project it is in the index.html in every fetch function)
  const token = req.headers["authorization"]
  // if there is no token provided
  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }
  // verification of the token provided
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Guard close if there is not matching the token (there is not the right person trying to get the data)
    if (err) {
      return res.status(401).json({ message: "Invalid token" })
    }
    // we are all good, the token is verified
    // the 'decoded.id' is actually id decoded from the users token
    req.userId = decoded.id
    // Now you can carry on and go to the reaching endpoint
    next()
  })
}

export default authMiddleware