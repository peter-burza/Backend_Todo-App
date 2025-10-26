import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../db.js"

const router = express.Router()

// Register a new user endpoint /auth/register
router.post("/register", (req, res) => {
  const { username, password } = req.body
  // save the username and an irreversibly encrypted password
  // save peterburza@gmail.com | aklsdjfasdf.asdf..qwe..q.we...qwe.qw.easd

  // encrypt the password
  const hashedPassword = bcrypt.hashSync(password, 8)

  // save the new user and hashed pass to the db
  try {
    // this is just preparation for a real action
    const insertUser = db.prepare(`INSERT INTO users (username, password)
            VALUES (?, ?)`)
    // this is actual action - the next line will insert the username and hashedPassword on the places of the ? in the prepared SQL command.
    const result = insertUser.run(username, hashedPassword)

    // Add default todo to a new user
    const defaultTodo = `Hello :) add your first todo!`
    const insertTodo = db.prepare(`INSERT INTO todos (user_id, task)
            VALUES (?, ?)`)
    insertTodo.run(result.lastInsertRowid, defaultTodo)

    // create a token
    const token = jwt.sign(
      { id: result.lastInsertRowid },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )
    res.json({ token })
  } catch (err) {
    console.log(err.message)
    res.sendStatus(503)
  }
})

router.post("/login", (req, res) => {
  // we get their email, and we look up the password associated with that email in the database
  // but we get it back and see it's encrypted, which means that we cannot compare it to the one the user just used trying to login
  // so what we can to do, is again, one way encrypt the password the user just entered

  const { username, password } = req.body

  try {
    // this is just preparation for a real action
    const getUser = db.prepare("SELECT * FROM users WHERE username = ?")
    // this is actual action - the next line will insert the username and hashedPassword on the places of the ? in the prepared SQL command.
    const user = getUser.get(username)
    // if we cannot find a user associated with that username, return out of the function
    if (!user) {
      return res.status(404).send({ message: "User not found" })
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password)
    // if the password does not match, return out of the function
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid password" })
    }
    console.log(user)

    // than we have a successfull authentication
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })
    res.json({ token })
  } catch (err) {
    console.log(err.message)
    res.sendStatus(503)
  }
})

export default router
