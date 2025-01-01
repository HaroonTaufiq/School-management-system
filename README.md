# Authentication Flow Documentation

## Overview

This document outlines the authentication flow in our school management system, detailing the use of NextAuth.js, custom middleware, and JSON Web Tokens (JWT).

## Technologies Used

- NextAuth.js: For handling authentication
- JSON Web Tokens (JWT): For secure information exchange
- Custom Middleware: For route protection and role-based access control

## Authentication Flow

1. **User Login**
   - User navigates to the `/login` page
   - User enters credentials (email and password)
   - Credentials are sent to the NextAuth.js endpoint (`/api/auth/[...nextauth]`)

2. **Credential Verification**
   - NextAuth.js uses the `CredentialsProvider`
   - The `authorize` function in `[...nextauth].ts` is called
   - User credentials are verified against the database
   - If valid, a user object is returned

3. **JWT Creation**
   - NextAuth.js creates a JWT containing user information
   - The `jwt` callback in `[...nextauth].ts` customizes the token
   - User ID, email, role, and school are added to the token

4. **Session Creation**
   - The `session` callback in `[...nextauth].ts` is called
   - User information from the JWT is added to the session
   - An access token is generated using the `generateToken` function

5. **Client-side Session Management**
   - The session is securely stored in an HTTP-only cookie
   - The `useSession` hook from NextAuth.js can be used to access session data in components

## Middleware

The custom middleware (`middleware.ts`) runs on every request to protected routes:

1. **Token Verification**
   - The middleware uses `getToken` from `next-auth/jwt` to verify the JWT
   - If no valid token is found, the user is redirected to the login page

2. **Role-based Access Control**
   - The middleware checks the user's role from the token
   - Access to specific routes is granted or denied based on the user's role:
     - Only superadmins can access `/dashboard/schools`
     - Superadmins cannot access `/dashboard/classrooms` or `/dashboard/students`

## JSON Web Tokens (JWT)

JWTs are used for secure information exchange between the client and server:

1. **Token Generation**
   - The `generateToken` function in `lib/jwt.ts` creates a new JWT
   - The token includes user information and has an expiration of 1 day

2. **Token Verification**
   - The `verifyToken` function in `lib/jwt.ts` checks if a token is valid
   - It uses the `JWT_SECRET` environment variable for verification

## Protected Routes

- All routes under `/dashboard` are protected by the middleware
- The `useSession` hook is used in components to check if a user is authenticated
- If no session exists, the user is redirected to the login page

## User Roles and Permissions

1. **Superadmin**
   - Can manage schools
   - Cannot directly manage classrooms or students

2. **School Admin**
   - Can manage classrooms and students within their school
   - Cannot manage other schools

3. **Regular User**
   - Limited access (specifics depend on application logic)

## Security Considerations

- Passwords are hashed using bcrypt before storing in the database
- JWTs are signed with a secret key to prevent tampering
- HTTP-only cookies are used to store the session token, protecting against XSS attacks
- The middleware provides an additional layer of security for protected routes

## Environment Variables

The following environment variables must be set:

- `NEXTAUTH_SECRET`: Used by NextAuth.js for cookie encryption
- `JWT_SECRET`: Used for signing and verifying JWTs

## Conclusion

This authentication system provides a secure, role-based access control mechanism for the school management system. It leverages NextAuth.js for easy integration with Next.js, uses JWTs for secure information exchange, and implements custom middleware for fine-grained access control.

