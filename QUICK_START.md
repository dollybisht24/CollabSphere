# 🎯 EduPro - Quick Reference Guide

## 📍 Access URLs

**Frontend Application:** http://localhost:3002  
**Backend API:** http://localhost:5000  
**API Health Check:** http://localhost:5000/api/health

---

## 🔑 Demo Login Credentials

**Email:** demo@edupro.com  
**Password:** demo123

---

## 🧭 Page Navigation

Once logged in, use the sidebar to navigate:

1. **Home** (`/`) - Feature showcase and welcome page
2. **Dashboard** (`/dashboard`) - Your learning statistics and progress
3. **Task Schedule** (`/tasks`) - Manage your assignments and to-dos
4. **Analytics** (`/analytics`) - View detailed learning insights
5. **Calendar** (`/calendar`) - Check your schedule and events

---

## ⚡ Quick Actions

### Creating a New Task
1. Go to **Task Schedule** page
2. Click the **"+ Add Task"** button
3. Fill in:
   - Task title
   - Due date
   - Priority (High/Medium/Low)
   - Category
4. Click **"Add Task"**

### Completing a Task
- Click the circle icon next to any task to mark it complete
- Completed tasks show a checkmark ✓

### Viewing Course Progress
- Dashboard shows your top 3 courses
- Each course card displays:
  - Course title and instructor
  - Progress percentage
  - Progress bar visualization

### Understanding Analytics
- **Monthly Progress Chart** - Study hours over last 7 months
- **Skills Radar** - Your proficiency in different subjects
- **Category Performance** - Completed, in-progress, and not-started items

---

## 🎨 UI Features

### Color-Coded Priorities
- 🔴 **Red** - High Priority
- 🟡 **Yellow** - Medium Priority
- 🟢 **Green** - Low Priority

### Interactive Elements
- Hover effects on all buttons and cards
- Smooth animations throughout
- Loading states for async operations
- Success/error messages for actions

---

## 🔧 Common Tasks

### Logging Out
Click your profile picture → Click **"Logout"** button in sidebar

### Viewing Profile
Your name and avatar are always visible in the sidebar

### Checking Statistics
Dashboard shows real-time stats:
- Total active courses
- Study hours this week
- Achievements earned
- Completed courses

---

## 📊 Available Data (Demo Account)

The demo account includes:
- ✅ 3 sample courses
- ✅ 3 sample tasks
- ✅ 7 days of analytics data
- ✅ Pre-populated statistics

---

## 🐛 Troubleshooting

### "Failed to fetch" Error
**Solution:** Restart the backend server
```bash
cd server
npm start
```

### Not Seeing Data
**Solution:** Re-seed the database
```bash
cd server
node seed.js
```

### Can't Login
**Solution:** Use demo credentials exactly as shown:
- Email: `demo@edupro.com`
- Password: `demo123`

### Page Won't Load
**Solution:** Check both servers are running
```bash
# Check backend
lsof -ti:5000

# Check frontend
lsof -ti:3002
```

---

## 📱 Mobile View

The app is fully responsive! Try it on:
- 📱 Mobile phones (portrait & landscape)
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop monitors

On mobile, use the **hamburger menu** (☰) to access navigation.

---

## 🎓 Learning Path

### For New Users:
1. **Start** → Login page
2. **Explore** → Go to Home page to see features
3. **Check Progress** → Visit Dashboard
4. **Add Tasks** → Go to Task Schedule and create your first task
5. **View Calendar** → See your schedule
6. **Analyze** → Check Analytics for insights

---

## 🔥 Pro Tips

1. **Set Priorities** - Use task priorities to focus on what matters
2. **Check Daily** - Visit Dashboard daily to track progress
3. **Use Calendar** - Plan your week with calendar view
4. **Monitor Analytics** - Weekly progress review in Analytics
5. **Stay Organized** - Categorize tasks for better management

---

## 🎯 Feature Highlights

### Dashboard Cards
- **Active Courses** - Shows total enrolled courses
- **Study Hours** - This week's learning time
- **Achievements** - Badges and milestones earned
- **Course Progress** - Overall completion percentage

### Charts & Graphs
- **Area Chart** - Weekly study patterns (7 days)
- **Pie Chart** - Course distribution by category
- **Bar Chart** - Monthly performance metrics
- **Radar Chart** - Skills assessment (5 categories)
- **Line Chart** - Long-term progress trends

### Task Features
- ✅ Add unlimited tasks
- ✅ Set due dates
- ✅ Priority levels (3 types)
- ✅ Category organization
- ✅ One-click completion
- ✅ Quick delete option
- ✅ Visual status indicators

### Calendar Features
- 📅 Monthly view
- 📅 Navigate months (< >)
- 📅 View events by date
- 📅 Color-coded events
- 📅 Event details sidebar
- 📅 Interactive date selection

---

## 🎨 Design Elements

### Animations
- Smooth page transitions
- Button hover effects
- Card entrance animations
- Loading spinners
- Progress bar animations

### Color Scheme
- **Primary:** Purple/Indigo gradient
- **Accent:** Pink/Purple
- **Success:** Green
- **Warning:** Yellow/Orange
- **Error:** Red

### Typography
- Clean, modern font
- Clear hierarchy
- Readable sizes
- Proper spacing

---

## 💡 What You Can Do

### Courses
- ✅ View all enrolled courses
- ✅ Track progress percentage
- ✅ See instructor information
- ✅ Monitor study hours
- ✅ Category-based filtering

### Tasks
- ✅ Create new tasks
- ✅ Edit existing tasks
- ✅ Delete tasks
- ✅ Mark as complete
- ✅ Set priorities
- ✅ Add categories
- ✅ Set due dates

### Analytics
- ✅ View monthly trends
- ✅ Compare categories
- ✅ Track skill development
- ✅ Monitor completion rates
- ✅ Analyze study patterns

### Profile
- ✅ View your information
- ✅ See avatar
- ✅ Track membership duration
- ✅ Quick logout access

---

## 📈 Understanding Your Stats

### Dashboard Metrics

**Active Courses**
- Shows number of courses you're currently enrolled in
- Displays completed course count

**Study Hours**
- Total hours logged this week
- Percentage change from last week

**Achievements**
- Total badges earned
- New achievements this month

**Course Progress**
- Overall completion percentage
- Average across all courses

---

## 🚀 Getting Started Checklist

- [ ] Open http://localhost:3002
- [ ] Login with demo account
- [ ] Explore the Dashboard
- [ ] Create your first task
- [ ] Check the Calendar
- [ ] View Analytics charts
- [ ] Navigate between pages
- [ ] Try mobile view (resize browser)

---

## 🎬 What's Next?

After exploring with the demo account:

1. **Create Your Account**
   - Click "Sign up for free"
   - Use a valid email format
   - Set a strong password (6+ characters)

2. **Customize Your Experience**
   - Add your own courses
   - Create personalized tasks
   - Set your schedule

3. **Track Your Progress**
   - Log study sessions
   - Complete tasks
   - Monitor improvements

---

## 📞 Need Help?

**Documentation:** See `PROJECT_GUIDE.md` for complete details  
**Common Issues:** Check troubleshooting section above  
**API Reference:** See PROJECT_GUIDE.md → API Endpoints section

---

**Ready to Start?** → Open http://localhost:3002 and login! 🚀

---

*Last Updated: February 23, 2026*
