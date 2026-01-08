const express = require('express');
const StudentStore = require('../stores/studentStore');
const FailureEngine = require('../engines/failureEngine');
const DailyTestEngine = require('../engines/dailyTestEngine');
const RecoveryEngine = require('../engines/recoveryEngine');

const router = express.Router();

// Get trainer dashboard - all students overview
router.get('/dashboard', (req, res) => {
  try {
    const students = StudentStore.getAllStudents();
    
    const studentsWithAnalysis = students.map(student => {
      const analysis = FailureEngine.analyzeStudent(student.id);
      const testAnalysis = DailyTestEngine.getTestAnalysis(student.id);
      const recentActivities = StudentStore.getRecentActivities(student.id, 3);
      
      return {
        id: student.id,
        name: student.name,
        status: analysis.riskLevel,
        insight: analysis.insight,
        trend: testAnalysis.trend,
        lastActivity: recentActivities.length > 0 
          ? recentActivities[recentActivities.length - 1].timestamp 
          : null,
        needsAttention: analysis.needsAttention,
        recoveryDetected: analysis.recoveryDetected
      };
    });

    res.json({
      students: studentsWithAnalysis,
      summary: {
        total: students.length,
        onTrack: studentsWithAnalysis.filter(s => s.status === 'On Track').length,
        needsAttention: studentsWithAnalysis.filter(s => s.status === 'Needs Attention').length,
        supportRecommended: studentsWithAnalysis.filter(s => s.status === 'Support Recommended').length
      }
    });

  } catch (error) {
    console.error('Trainer dashboard error:', error);
    res.status(500).json({ message: 'Failed to load trainer dashboard' });
  }
});

// Get detailed student view for trainer
router.get('/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const student = StudentStore.getStudent(studentId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const analysis = FailureEngine.analyzeStudent(studentId);
    const testAnalysis = DailyTestEngine.getTestAnalysis(studentId);
    const recoveryGuidance = RecoveryEngine.generateRecoveryGuidance(studentId);
    const recoveryProgress = RecoveryEngine.trackRecoveryProgress(studentId);
    
    // Get last 3 sessions (activities + tests combined)
    const activities = StudentStore.getRecentActivities(studentId, 7);
    const tests = DailyTestEngine.getTestHistory(studentId, 7);
    
    const allSessions = [
      ...activities.map(a => ({ ...a, type: 'activity' })),
      ...tests.map(t => ({ ...t, type: 'test' }))
    ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

    res.json({
      student: {
        id: student.id,
        name: student.name
      },
      analysis,
      testAnalysis,
      recoveryGuidance,
      recoveryProgress,
      recentSessions: allSessions,
      laggingTopics: analysis.laggingTopics,
      totalActivities: StudentStore.getActivities(studentId).length,
      totalTests: StudentStore.getDailyTests(studentId).length
    });

  } catch (error) {
    console.error('Student detail error:', error);
    res.status(500).json({ message: 'Failed to load student details' });
  }
});

// Get student performance summary
router.get('/student/:studentId/summary', (req, res) => {
  try {
    const { studentId } = req.params;
    const student = StudentStore.getStudent(studentId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const activities = StudentStore.getActivities(studentId);
    const tests = StudentStore.getDailyTests(studentId);
    const analysis = FailureEngine.analyzeStudent(studentId);

    // Calculate basic stats without exposing raw numbers to UI
    const totalSessions = activities.length + tests.length;
    const recentActivity = activities.length > 0 || tests.length > 0;
    
    const summary = {
      studentName: student.name,
      hasActivity: recentActivity,
      status: analysis.riskLevel,
      insight: analysis.insight,
      laggingTopics: analysis.laggingTopics,
      recoveryDetected: analysis.recoveryDetected,
      lastSessionDate: null
    };

    // Get last session date
    const allSessions = [...activities, ...tests];
    if (allSessions.length > 0) {
      const lastSession = allSessions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      summary.lastSessionDate = lastSession.timestamp;
    }

    res.json(summary);

  } catch (error) {
    console.error('Student summary error:', error);
    res.status(500).json({ message: 'Failed to load student summary' });
  }
});

module.exports = router;