import express from 'express'
import dotenv from 'dotenv'
import router from './routers/routers'
import cors from 'cors'

dotenv.config()

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(
   cors({
      // origin: 'http://localhost:5173', // your Vite dev server's origin
      origin: true,
      credentials: false, // only needed if you're sending cookies/auth headers
   }),
)

app.use(router)
const port = process.env.PORT || 3000

app.listen(port, () => {
   console.log(`Server is running on port ${port}`)
})
