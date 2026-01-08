const StudentStore = require('../stores/studentStore');

class DailyTestEngine {
  static canTakeTest(studentId) {
    const todaysTest = StudentStore.getTodaysTest(studentId);
    return !todaysTest;
  }

  static submitTest(studentId, testData) {
    if (!this.canTakeTest(studentId)) {
      throw new Error('Daily test already completed for today');
    }

    const { topic, attempts, correct, timeSpent, reflection } = testData;

    if (!topic || attempts < 1 || correct < 0 || timeSpent < 0) {
      throw new Error('Invalid test data');
    }

    if (correct > attempts) {
      throw new Error('Correct answers cannot exceed total attempts');
    }

    const test = StudentStore.addDailyTest(studentId, {
      topic,
      attempts,
      correct,
      timeSpent,
      reflection: reflection || ''
    });

    return test;
  }

  static getTestHistory(studentId, days = 30) {
    const tests = StudentStore.getDailyTests(studentId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return tests
      .filter(test => new Date(test.timestamp) > cutoff)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  static getTestAnalysis(studentId) {
    const tests = this.getTestHistory(studentId, 7);
    
    if (tests.length === 0) {
      return {
        trend: 'No recent tests',
        message: 'Take your first daily test to start tracking progress.'
      };
    }

    const latest = tests[0];
    const successRate = latest.correct / latest.attempts;

    if (tests.length === 1) {
      return {
        trend: 'Getting started',
        message: 'Great job taking your first test! Keep it up tomorrow.'
      };
    }

    const previous = tests[1];
    const previousRate = previous.correct / previous.attempts;
    
    if (successRate > previousRate) {
      return {
        trend: 'Improving',
        message: 'You adjusted well after your last session.'
      };
    } else if (successRate < previousRate) {
      return {
        trend: 'Declining',
        message: 'If this continues, a short reset could help.'
      };
    } else {
      return {
        trend: 'Stable',
        message: 'Your performance is consistent across sessions.'
      };
    }
  }
}

module.exports = DailyTestEngine;