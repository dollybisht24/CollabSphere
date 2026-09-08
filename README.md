# EduPro - Learning Management System

A modern, full-stack Learning Management System (LMS) built with React, Node.js, Express, MongoDB, Tailwind CSS, and Framer Motion. EduPro provides a seamless learning experience with beautiful animations, comprehensive analytics, and an intuitive user interface.

## ✨ Features

### 🔐 Authentication System
- **JWT-based Authentication** - Secure token-based authentication
- **Glassmorphic Login/Signup Pages** - Modern, animated authentication flow
- **Protected Routes** - Secure access to the platform
- **Password Hashing** - bcryptjs for secure password storage
- **Form Validation** - Both client and server-side validation

### 🌐 Backend API
- **RESTful API** - Well-structured API endpoints
- **MongoDB Database** - NoSQL database for data persistence
- **Express Server** - Fast and minimal web framework
- **Middleware Authentication** - JWT verification for protected routes
- **Input Validation** - Express-validator for data validation

### 🏠 Home Page
- **Hero Section** - Welcoming introduction with user personalization
- **Bento Box Design** - Clean grid layout showcasing platform features
- **3D Illustrations** - High-quality visual elements
- **Quick Stats** - Overview of user progress

### 📊 Dashboard
- **Analytics Charts** - Visualize learning progress with Recharts
- **Study Hours Tracking** - Area charts showing weekly study patterns
- **Course Distribution** - Pie charts for course categories
- **Recent Courses** - Continue learning from where you left off
- **Quick Actions** - Access to live classes, assignments, and completed courses

### ✅ Task Schedule
- **Task Management** - Create, complete, and delete tasks
- **Priority Categorization** - Low, Medium, High priority levels
- **Due Date Tracking** - Never miss a deadline
- **Completion Statistics** - Track your productivity
- **Beautiful UI** - Color-coded tasks with smooth animations

### 📈 Analytics
- **Detailed Insights** - Comprehensive learning statistics
- **Multiple Chart Types** - Area, Bar, Line, and Radar charts
- **Skills Assessment** - Radar chart showing proficiency levels
- **Monthly Trends** - Track progress over time
- **Performance Metrics** - Category-wise performance analysis
- **Achievement Tracking** - Badges and milestones

### 📅 Interactive Calendar
- **Monthly Grid View** - Full calendar with event indicators
- **Event Sidebar** - Detailed view of selected date's events
- **Multiple Event Types** - Classes, tasks, and reminders
- **Participant Management** - See who's involved in each event
- **Upcoming Events** - Quick view of the week ahead
- **Color-Coded Events** - Easy visual distinction

### 🎨 Design System

#### Colors
- **Primary Purple**: `#6366F1` (Royal Purple)
- **Mint Green**: `#A7F3D0` (Accent)
- **Pastel Peach**: `#FED7AA` (Accent)

#### UI Components
- **Border Radius**: 16px-20px for cards
- **Shadows**: Soft, natural elevation shadows
- **Glassmorphism**: Frosted glass effects for authentication
- **Smooth Animations**: Framer Motion throughout

### 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Collapsible sidebar for mobile
- Touch-friendly interactions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project folder)
   ```bash
   cd "learning app"
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   Backend `server/.env` (already created):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/edupro_lms
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

5. **Start MongoDB**
   ```bash
   # On Linux/Mac
   sudo systemctl start mongod
   
   # Or via Homebrew (Mac)
   brew services start mongodb-community
   ```

6. **Seed the database (optional)**
   ```bash
   cd server
   npm run seed
   cd ..
   ```
   This creates a demo user: `demo@edupro.com` / `demo123`

7. **Start the backend server**
   ```bash
   cd server
   npm run dev
   # Server runs on http://localhost:5000
   ```
utils/
│   │   └── api.js              # API service functions
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── server/
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Course.js           # Course model
│   │   ├── Task.js             # Task model
│   │   └── Analytics.js        # Analytics model
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── user.js             # User routes
│   │   ├── courses.js          # Course routes
│   │   ├── tasks.js            # Task routes
│   │   └── analytics.js        # Analytics routes
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── server.js               # Server entry point
│   ├── seed.js                 # Database seeding script
│   ├── package.json
│   └── .env
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation and routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Recharts** - Charting library
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)

### Courses
- `GET /api/courses` - Get all user courses (protected)
- `POST /api/courses` - Create new course (protected)
- `PUT /api/courses/:id` - Update course (protected)
- `DELETE /api/courses/:id` - Delete course (protected)
- `GET /api/courses/stats` - Get course statistics (protected)

### Tasks
- `GET /api/tasks` - Get all user tasks (protected)
- `POST /api/tasks` - Create new task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `PATCH /api/tasks/:id/toggle` - Toggle task completion (protected)
- `GET /api/tasks/stats` - Get task statistics (protected)

### Analytics
- `GET /api/analytics` - Get analytics data (protected)
- `POST /api/analytics` - Add analytics entry (protected)
- `GET /api/analytics/summary` - Get summary statistics (protected)
After running the seed script:
- Email: `demo@edupro.com`
- Password: `demo123`

Or create your own account via the signup page.

## 📁 Project Structure

```
learning app/
├── src/
│   ├── components/
│   │   └── MainLayout.jsx      # Main app layout with sidebar
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Signup page
│   │   ├── Home.jsx            # Home/Hero page
│   │   ├── Dashboard.jsx       # Dashboard with analytics
│   │   ├── TaskSchedule.jsx    # Task management
│   │   ├── Analytics.jsx       # Detailed analytics
│   │   └── Calendar.jsx        # Interactive calendar
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── public/
├── index.htmlStatus

- [x] Backend integration with real API
- [x] JWT authentication
- [x] MongoDB data persistence
- [x] Course management
- [x] Task scheduling
- [x] Analytics tracking
- [ ] Real-time notifications
- [ ] Video player integration
- [ ] Quiz and assessment module
- [ ] Certificate generation
- [ ] Discussion forums
- [ ] Live chat functionality
- [ ] File upload/download
- [ ] Email notifications

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check connection string in `server/.env`
- Verify MongoDB is on port 27017

### Port Already in Use
- Backend: Change `PORT` in `server/.env`
- Frontend: Vite will suggest alternative port

### CORS Issues
- Check backend CORS configuration
- Verify `VITE_API_URL` matches backend URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the ISC License.

## 💡 Credits

Built with ❤️ using modern web technologies.

---

**Note**: This is now a full-stack application with authentication and data persistence. For production deployment, ensure you:
- Change the JWT_SECRET to a secure random string
- Use environment-specific configurations
- Enable HTTPS
- Implement rate limiting
- Add input sanitization
- Set up proper error logging
All pages include beautiful empty states with:
- Relevant icons
- Helpful messages
- Call-to-action buttons

### Animations
- Page transitions
- Hover effects
- Loading states
- Modal animations
- Chart animations

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#6366F1', // Your primary color
    light: '#818CF8',
    dark: '#4F46E5',
  }
}
```

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation item in `src/components/MainLayout.jsx`

## 📝 Features Roadmap

- [ ] Backend integration with real API
- [ ] Real-time notifications
- [ ] Video player integration
- [ ] Quiz and assessment module
- [ ] Certificate generation
- [ ] Discussion forums
- [ ] Live chat functionality
- [ ] File upload/download
- [ ] Progress persistence
- [ ] Email notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 💡 Credits

Built with ❤️ using modern web technologies.

---

**Note**: This is a frontend-only application with mock data. For production use, integrate with a backend API for authentication, data persistence, and real-time features.
