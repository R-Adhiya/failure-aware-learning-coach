const express = require('express');
const StudentStore = require('../stores/studentStore');
const TopicStore = require('../stores/topicStore');
const FailureEngine = require('../engines/failureEngine');
const DailyTestEngine = require('../engines/dailyTestEngine');
const RecoveryEngine = require('../engines/recoveryEngine');

const router = express.Router();

// Get student dashboard data
router.get('/dashboard/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const student = StudentStore.getStudent(studentId);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const analysis = FailureEngine.analyzeStudent(studentId);
    const testAnalysis = DailyTestEngine.getTestAnalysis(studentId);
    const recoveryGuidance = RecoveryEngine.generateRecoveryGuidance(studentId);
    const canTakeTest = DailyTestEngine.canTakeTest(studentId);
    const recentActivities = StudentStore.getRecentActivities(studentId, 7);

    res.json({
      student: {
        id: student.id,
        name: student.name
      },
      analysis,
      testAnalysis,
      recoveryGuidance,
      canTakeTest,
      recentActivities: recentActivities.slice(-5),
      topics: TopicStore.getAllTopics()
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// Add learning activity
router.post('/activity/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const { topic, attempts, correct, timeSpent } = req.body;

    if (!topic || attempts < 1 || correct < 0 || timeSpent < 0) {
      return res.status(400).json({ message: 'Invalid activity data' });
    }

    if (correct > attempts) {
      return res.status(400).json({ message: 'Correct answers cannot exceed attempts' });
    }

    // Add custom topic if it doesn't exist
    TopicStore.addTopic(topic);

    const activity = StudentStore.addActivity(studentId, {
      topic,
      attempts: parseInt(attempts),
      correct: parseInt(correct),
      timeSpent: parseInt(timeSpent)
    });

    res.json({ success: true, activity });

  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ message: 'Failed to add activity' });
  }
});

// Submit daily test
router.post('/daily-test/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const { topic, attempts, correct, timeSpent, reflection } = req.body;

    const test = DailyTestEngine.submitTest(studentId, {
      topic,
      attempts: parseInt(attempts),
      correct: parseInt(correct),
      timeSpent: parseInt(timeSpent),
      reflection
    });

    // Add custom topic if it doesn't exist
    TopicStore.addTopic(topic);

    res.json({ success: true, test });

  } catch (error) {
    console.error('Daily test error:', error);
    if (error.message === 'Daily test already completed for today') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to submit test' });
  }
});

// Check if can take daily test
router.get('/can-take-test/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const canTake = DailyTestEngine.canTakeTest(studentId);
    res.json({ canTakeTest: canTake });
  } catch (error) {
    console.error('Check test error:', error);
    res.status(500).json({ message: 'Failed to check test status' });
  }
});

// Get test history
router.get('/test-history/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const history = DailyTestEngine.getTestHistory(studentId, 30);
    res.json({ history });
  } catch (error) {
    console.error('Test history error:', error);
    res.status(500).json({ message: 'Failed to get test history' });
  }
});

// Get activities
router.get('/activities/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const activities = StudentStore.getActivities(studentId);
    res.json({ activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Failed to get activities' });
  }
});

// Add custom topic
router.post('/topic', (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic || !topic.trim()) {
      return res.status(400).json({ message: 'Topic name is required' });
    }

    const added = TopicStore.addTopic(topic.trim());
    
    if (added) {
      res.json({ success: true, topic: topic.trim() });
    } else {
      res.status(400).json({ message: 'Invalid topic name' });
    }
  } catch (error) {
    console.error('Add topic error:', error);
    res.status(500).json({ message: 'Failed to add topic' });
  }
});

module.exports = router;