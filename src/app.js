import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors(
    { origin: process.env.CORS_ORIGIN, credentials: true })
)
app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ limit: '16kb', extended: true }))
app.use(express.static('public'))
app.use(cookieParser())

// routes import 

import userRouter from './routes/user.route.js'
import videoRouter from './routes/video.route.js'
import subscriptionRouter from './routes/subscription.route.js'
import tweetRouter from './routes/tweet.route.js'

app.use('/api/v1/users', userRouter)
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/subs', subscriptionRouter)
app.use('/api/v1/tweets', tweetRouter)


export { app }