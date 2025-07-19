import Cors from 'cors'
import initMiddleware from './init-middleware'

// Setup CORS to allow requests from localhost:8080
export const cors = initMiddleware(
  Cors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
)