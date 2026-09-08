# Google OAuth Setup Instructions

## Overview
Google OAuth has been integrated into the EdupPro Learning Management System. Users can now log in using their Google account in addition to email/password authentication.

## Features
- ✅ Email/Password authentication with JWT tokens
- ✅ Google OAuth 2.0 login
- ✅ Automatic user creation for new Google sign-ins
- ✅ Protected routes requiring authentication

## Setting Up Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted:
   - Application name: EdupPro LMS
   - User support email: Your email
   - Developer contact: Your email
   - Add scope: email, profile
6. Select **Web application** as the application type
7. Configure authorized origins and redirect URIs:
   - **Authorized JavaScript origins**: 
     - `http://localhost:5000`
     - `http://localhost:5173`
   - **Authorized redirect URIs**: 
     - `http://localhost:5000/api/auth/google/callback`
8. Click **Create** and copy:
   - Client ID
   - Client Secret

### Step 2: Update Environment Variables

Update the `server/.env` file with your Google OAuth credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

Replace `your_actual_google_client_id_here` and `your_actual_google_client_secret_here` with the values from Step 1.

### Step 3: Restart the Backend Server

After updating the `.env` file, restart the backend server:

```bash
cd server
npm run dev
```

## Testing the Application

### 1. Email/Password Login

**Demo Account:**
- Email: `demo@edupro.com`
- Password: `demo123`

**Or create a new account:**
- Navigate to `http://localhost:5173/signup`
- Fill in your details
- Click "Sign Up"

### 2. Google OAuth Login

1. Navigate to `http://localhost:5173/login`
2. Click the "Google" button
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions
6. You'll be automatically redirected back to the dashboard

## How It Works

### Authentication Flow

**Email/Password:**
```
User → Login Form → Backend API → JWT Token → localStorage → Dashboard
```

**Google OAuth:**
```
User → "Google" Button → Google Login → Backend Callback → JWT Token → Frontend Callback → localStorage → Dashboard
```

### API Endpoints

- `POST /api/auth/login` - Email/password login
- `POST /api/auth/signup` - Create new account
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `GET /api/user/profile` - Fetch user profile (protected)

### Frontend Routes

- `/login` - Login page with email/password and Google OAuth
- `/signup` - Registration page
- `/auth/callback` - OAuth callback handler
- `/` - Protected dashboard (requires authentication)
- `/tasks` - Task management (protected)
- `/analytics` - Analytics dashboard (protected)
- `/calendar` - Calendar view (protected)

## Security Features

1. **JWT Authentication**: All API requests use JWT tokens
2. **Password Hashing**: Passwords are hashed using bcrypt
3. **Protected Routes**: Frontend and backend routes require valid authentication
4. **Session Management**: Express sessions handle OAuth flow
5. **CORS Configuration**: Restricted to frontend URL only

## Troubleshooting

### Google OAuth Not Working

1. **Check credentials**: Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set in `.env`
2. **Verify redirect URIs**: Make sure `http://localhost:5000/api/auth/google/callback` is added to Google Console
3. **Check ports**: Ensure backend is on port 5000 and frontend is on port 5173
4. **Clear cookies**: Try clearing browser cookies and cache
5. **Restart server**: Restart the backend server after changing `.env`

### Login Fails

1. **MongoDB running**: Ensure MongoDB container is running (`docker ps`)
2. **Backend running**: Check backend is running on port 5000
3. **Check credentials**: Verify email/password are correct
4. **Network errors**: Check browser console for API errors

### Port Conflicts

If ports 5000 or 5173 are in use:
- Backend: Change `PORT` in `server/.env`
- Frontend: Update `vite.config.js`

## Project Structure

```
server/
├── config/
│   └── passport.js         # Passport Google OAuth configuration
├── models/
│   └── User.js            # Updated with googleId field
├── routes/
│   └── auth.js            # Authentication routes + Google OAuth
├── middleware/
│   └── auth.js            # JWT verification middleware
├── .env                   # Environment variables (Update here!)
└── server.js              # Express server with session & passport

src/
├── pages/
│   ├── Login.jsx          # Login with Google button
│   ├── Signup.jsx         # Signup with Google button
│   └── OAuthCallback.jsx  # OAuth redirect handler
├── context/
│   └── AuthContext.jsx    # Authentication state management
└── App.jsx                # Routes including OAuth callback
```

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Update `.env` file
3. ✅ Restart backend server
4. ✅ Test email/password login
5. ✅ Test Google OAuth login
6. 🎉 Start using the application!

## Support

For issues or questions:
- Check the troubleshooting section above
- Review backend logs: Terminal running `npm run dev`
- Check frontend console: Browser developer tools (F12)
- Verify MongoDB: `docker logs edupro-mongodb`
