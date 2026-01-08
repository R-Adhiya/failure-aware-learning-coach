const StudentStore = require('../stores/studentStore');

class FailureEngine {
  static analyzeStudent(studentId) {
    const activities = StudentStore.getRecentActivities(studentId, 7);
    const dailyTests = StudentStore.getDailyTests(studentId);
    
    const analysis = {
      riskLevel: 'On Track',
      insight: 'Keep up the good work with your learning routine.',
      laggingTopics: [],
      needsAttention: false,
      recoveryDetected: false
    };

    if (activities.length === 0 && dailyTests.length === 0) {
      return analysis;
    }

    // Analyze failure patterns
    const failures = this.detectFailurePatterns(activities, dailyTests);
    
    // Determine risk level
    analysis.riskLevel = this.calculateRiskLevel(failures);
    
    // Generate insight
    analysis.insight = this.generateInsight(failures, activities, dailyTests);
    
    // Identify lagging topics
    analysis.laggingTopics = this.identifyLaggingTopics(activities, dailyTests);
    
    // Check for recovery
    analysis.recoveryDetected = this.detectRecovery(activities, dailyTests);
    
    analysis.needsAttention = analysis.riskLevel !== 'On Track';

    return analysis;
  }

  static detectFailurePatterns(activities, dailyTests) {
    const failures = {
      conceptual: 0,
      cognitiveOverload: 0,
      consistencyBreakdown: 0,
      topicAvoidance: 0,
      difficultyPlateau: 0
    };

    // Analyze activities for failure patterns
    activities.forEach(activity => {
      if (activity.attempts >= 3) {
        failures.conceptual++;
      }
      if (activity.timeSpent >= 20 && activity.correct < activity.attempts * 0.5) {
        failures.cognitiveOverload++;
      }
    });

    // Check for consistency issues
    const lastActivity = activities[activities.length - 1];
    if (lastActivity) {
      const daysSinceLastActivity = (new Date() - new Date(lastActivity.timestamp)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity >= 2) {
        failures.consistencyBreakdown++;
      }
    }

    // Check daily tests for patterns
    const recentTests = dailyTests.slice(-4);
    if (recentTests.length >= 4) {
      const improvements = recentTests.slice(1).map((test, i) => 
        test.correct > recentTests[i].correct
      );
      if (improvements.filter(Boolean).length === 0) {
        failures.difficultyPlateau++;
      }
    }

    return failures;
  }

  static calculateRiskLevel(failures) {
    const totalFailures = Object.values(failures).reduce((sum, count) => sum + count, 0);
    
    if (totalFailures === 0) return 'On Track';
    if (totalFailures <= 2) return 'Needs Attention';
    return 'Support Recommended';
  }

  static generateInsight(failures, activities, dailyTests) {
    const totalFailures = Object.values(failures).reduce((sum, count) => sum + count, 0);
    
    if (totalFailures === 0) {
      return 'Your learning pattern shows consistent progress.';
    }

    if (failures.conceptual > 0) {
      return 'Consider breaking down complex topics into smaller steps.';
    }

    if (failures.cognitiveOverload > 0) {
      return 'Taking shorter, focused sessions might help your understanding.';
    }

    if (failures.consistencyBreakdown > 0) {
      return 'Regular practice, even for short periods, can strengthen your learning.';
    }

    if (failures.difficultyPlateau > 0) {
      return 'Trying a different approach to these topics could unlock new progress.';
    }

    return 'Your learning journey is progressing well with room for growth.';
  }

  static identifyLaggingTopics(activities, dailyTests) {
    const topicPerformance = new Map();

    // Analyze activities by topic
    activities.forEach(activity => {
      if (!topicPerformance.has(activity.topic)) {
        topicPerformance.set(activity.topic, {
          attempts: 0,
          correct: 0,
          timeSpent: 0,
          sessions: 0
        });
      }
      
      const perf = topicPerformance.get(activity.topic);
      perf.attempts += activity.attempts;
      perf.correct += activity.correct;
      perf.timeSpent += activity.timeSpent;
      perf.sessions++;
    });

    // Analyze daily tests by topic
    dailyTests.forEach(test => {
      if (!topicPerformance.has(test.topic)) {
        topicPerformance.set(test.topic, {
          attempts: 0,
          correct: 0,
          timeSpent: 0,
          sessions: 0
        });
      }
      
      const perf = topicPerformance.get(test.topic);
      perf.attempts += test.attempts;
      perf.correct += test.correct;
      perf.timeSpent += test.timeSpent;
      perf.sessions++;
    });

    // Identify lagging topics
    const laggingTopics = [];
    topicPerformance.forEach((perf, topic) => {
      const successRate = perf.correct / perf.attempts;
      const avgTimePerAttempt = perf.timeSpent / perf.attempts;
      
      if (successRate < 0.6 || avgTimePerAttempt > 5) {
        laggingTopics.push(topic);
      }
    });

    return laggingTopics;
  }

  static detectRecovery(activities, dailyTests) {
    const recentActivities = activities.slice(-3);
    const recentTests = dailyTests.slice(-2);
    
    if (recentActivities.length < 2 && recentTests.length < 2) {
      return false;
    }

    // Check for improvement in recent activities
    if (recentActivities.length >= 2) {
      const recent = recentActivities[recentActivities.length - 1];
      const previous = recentActivities[recentActivities.length - 2];
      
      if (recent.correct > previous.correct || recent.timeSpent < previous.timeSpent) {
        return true;
      }
    }

    // Check for improvement in recent tests
    if (recentTests.length >= 2) {
      const recent = recentTests[recentTests.length - 1];
      const previous = recentTests[recentTests.length - 2];
      
      if (recent.correct > previous.correct) {
        return true;
      }
    }

    return false;
  }
}

module.exports = FailureEngine;