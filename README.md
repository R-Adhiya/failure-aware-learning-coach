# Failure-Aware Learning Coach

A proactive learning system that tracks learning behavior, detects early failure patterns, and provides deterministic, rule-based guidance for both Students and Trainers.

## Features

### For Students
- **Learning Activity Tracking**: Record learning sessions with topics, attempts, correct answers, and time spent
- **Daily Tests**: Take once-per-day tests to track progress over time
- **Custom Topics**: Add your own learning topics beyond the predefined ones
- **Voice Reflections**: Optional voice recording for session reflections
- **Personalized Insights**: Get calm, mentor-style guidance based on your learning patterns
- **Recovery Detection**: System recognizes when you're improving after struggles

### For Trainers
- **Student Overview**: See all students' current status and trends at a glance
- **Detailed Analysis**: Dive deep into individual student performance
- **Early Warning System**: Identify students who need attention before they fall behind
- **Recovery Tracking**: Monitor students who are bouncing back from difficulties
- **Lagging Topic Identification**: See which subjects need extra focus for each student

### Intelligent Analysis Engine
- **Failure Pattern Detection**: Identifies conceptual failures, cognitive overload, consistency issues, and more
- **Risk Assessment**: Categorizes students as "On Track", "Needs Attention", or "Support Recommended"
- **Trend Analysis**: Tracks improvement and decline patterns over time
- **Deterministic Logic**: All insights are based on clear rules, not black-box AI

## Tech Stack

- **Frontend**: React with React Router, plain CSS
- **Backend**: Node.js with Express
- **Storage**: In-memory data structures (no database required)
- **Deployment**: Designed for Railway, Render, or Vercel

## Quick Start

### Development
```bash
# Install all dependencies
npm run install-all

# Start development servers (backend + frontend)
npm run dev
```

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
For production deployment, set:
- `PORT`: Server port (automatically set by most hosting platforms)
- `REACT_APP_API_URL`: Frontend API base URL (optional, defaults to same domain)

## Deployment

### Railway
1. Connect your GitHub repository
2. Railway will automatically detect the Node.js app
3. The `postinstall` script will build the frontend automatically

### Render
1. Create a new Web Service
2. Connect your repository
3. Set build command: `npm run build`
4. Set start command: `npm start`

### Vercel (Frontend + Backend)
1. Deploy as a Node.js application
2. Vercel will handle the build process automatically

## Application Flow

### Student Journey
1. **Login**: Enter name, ID, and select "Student" role
2. **Dashboard**: View learning status, insights, and test availability
3. **Add Activities**: Record learning sessions with performance data
4. **Daily Tests**: Take one test per day to track progress
5. **Get Guidance**: Receive personalized suggestions and recovery tips

### Trainer Journey
1. **Login**: Enter name, ID, and select "Trainer" role
2. **Overview**: See all students' status and trends
3. **Student Details**: Click any student for detailed analysis
4. **Monitor Progress**: Track recovery patterns and identify at-risk students

## Key Design Principles

- **No Percentages or Scores**: Focus on qualitative insights rather than numbers
- **Mentor-Style Language**: Calm, supportive guidance without judgment
- **Progressive Disclosure**: Show one insight at a time to avoid overwhelm
- **Deterministic Analysis**: All recommendations based on clear, explainable rules
- **Privacy-First**: No external AI services, all processing happens locally

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/user/:id` - Get user info

### Student Features
- `GET /api/student/dashboard/:studentId` - Get dashboard data
- `POST /api/student/activity/:studentId` - Add learning activity
- `POST /api/student/daily-test/:studentId` - Submit daily test
- `GET /api/student/can-take-test/:studentId` - Check test availability

### Trainer Features
- `GET /api/trainer/dashboard` - Get all students overview
- `GET /api/trainer/student/:studentId` - Get detailed student analysis

## Contributing

This application was built for hackathon evaluation with a focus on:
- Complete functionality from login to insights
- Clean, accessible UI design
- Deterministic, explainable analysis
- Production-ready deployment capability

The codebase is structured for easy extension and modification while maintaining the core principle of supportive, non-judgmental learning guidance.