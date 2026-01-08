const StudentStore = require('../stores/studentStore');
const FailureEngine = require('./failureEngine');

class RecoveryEngine {
  static generateRecoveryGuidance(studentId) {
    const analysis = FailureEngine.analyzeStudent(studentId);
    const activities = StudentStore.getRecentActivities(studentId, 7);
    const dailyTests = StudentStore.getDailyTests(studentId);
    
    const guidance = {
      status: analysis.riskLevel,
      primaryMessage: analysis.insight,
      suggestions: [],
      encouragement: '',
      warningMessage: ''
    };

    // Generate specific suggestions based on analysis
    if (analysis.laggingTopics.length > 0) {
      guidance.suggestions.push(`Focus on: ${analysis.laggingTopics.slice(0, 2).join(', ')}`);
    }

    if (analysis.riskLevel === 'Support Recommended') {
      guidance.suggestions.push('Consider shorter, more frequent study sessions');
      guidance.suggestions.push('Break complex topics into smaller parts');
      guidance.warningMessage = 'If this continues, a short reset could help.';
    } else if (analysis.riskLevel === 'Needs Attention') {
      guidance.suggestions.push('Try a different approach to challenging topics');
      guidance.suggestions.push('Maintain consistent daily practice');
    }

    // Add encouragement based on recovery detection
    if (analysis.recoveryDetected) {
      guidance.encouragement = 'You adjusted well after your last session.';
    } else if (analysis.riskLevel === 'On Track') {
      guidance.encouragement = 'Your learning pattern shows steady progress.';
    }

    // Add activity-specific guidance
    if (activities.length > 0) {
      const avgTimePerSession = activities.reduce((sum, act) => sum + act.timeSpent, 0) / activities.length;
      if (avgTimePerSession > 15) {
        guidance.suggestions.push('Consider shorter, focused sessions');
      }
    }

    return guidance;
  }

  static getRecoveryStrategies(riskLevel, laggingTopics) {
    const strategies = [];

    switch (riskLevel) {
      case 'Support Recommended':
        strategies.push('Take a 1-2 day break to reset your approach');
        strategies.push('Focus on one topic at a time');
        strategies.push('Use active recall instead of passive reading');
        break;
      
      case 'Needs Attention':
        strategies.push('Review your study environment for distractions');
        strategies.push('Try explaining concepts out loud');
        strategies.push('Connect new topics to what you already know');
        break;
      
      default:
        strategies.push('Continue your current learning routine');
        strategies.push('Gradually increase topic complexity');
        break;
    }

    if (laggingTopics.length > 0) {
      strategies.push(`Dedicate extra time to: ${laggingTopics.join(', ')}`);
    }

    return strategies;
  }

  static trackRecoveryProgress(studentId) {
    const recentTests = StudentStore.getDailyTests(studentId).slice(-5);
    
    if (recentTests.length < 3) {
      return {
        inRecovery: false,
        message: 'Not enough data to track recovery'
      };
    }

    const improvements = [];
    for (let i = 1; i < recentTests.length; i++) {
      const current = recentTests[i];
      const previous = recentTests[i - 1];
      const currentRate = current.correct / current.attempts;
      const previousRate = previous.correct / previous.attempts;
      
      improvements.push(currentRate > previousRate);
    }

    const recentImprovements = improvements.slice(-2);
    const isRecovering = recentImprovements.filter(Boolean).length >= 1;

    return {
      inRecovery: isRecovering,
      message: isRecovering 
        ? 'Recovery pattern detected in recent sessions'
        : 'Continue working on consistent improvement'
    };
  }
}

module.exports = RecoveryEngine;