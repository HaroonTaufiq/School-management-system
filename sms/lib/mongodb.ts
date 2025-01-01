import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }

    const conn = await mongoose.connect(uri as string)
    return conn
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

// Handling connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  process.exit(0)
})