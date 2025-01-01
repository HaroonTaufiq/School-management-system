import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface Payload {
  id: string;
  email: string;
  role: string;
  school?: string;
  isAdmin?: boolean;
  exp?: number
}

export function generateToken(payload: Payload): string {
  const options: jwt.SignOptions = {};
  if (!payload.exp) {
    options.expiresIn = '1d';
    
  }
  console.log('payload', payload)
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): Payload | null {
  try {
    // console.log('token', token)
    const payload = jwt.verify(token, JWT_SECRET)
    // console.log('payload', payload)
    
    return payload as Payload
  } catch (error) {
    console.log('error', error)
    return null
  }
}

