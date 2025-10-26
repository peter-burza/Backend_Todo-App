import express from "express"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
// here when we import this routes the name for example: authRoutes, does not have to match with the name that is exporting in the file where it is defined... 
import authRoutes from './routes/authRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import authMiddleware from "./middleware/authmiddleware.js"

const app = express()
const PORT = process.env.PORT || 5003

// GET the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url)
// Get the directory name from the file path
const __dirname = dirname(__filename)

// Middleware
app.use(express.json())
// Serves the HTML file from the /public directory
// Tells express to serve all the files from the public folder as static assets / files. Any requests for the css files will be esolved to the public directory
app.use(express.static(path.join(__dirname, '../public')))

// Serving up the HTML file from the public directory
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Routes (this line kinda imports the routes defined in authRoutes.js in here...)
app.use('/auth', authRoutes)
// we added the authMiddleware there, so all requests heading to all of our routes is 'protected' by the authMiddleware
app.use('/todos', authMiddleware, todoRoutes)

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`)
})
