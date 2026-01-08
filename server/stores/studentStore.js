// In-memory storage for student data
const students = new Map();
const activities = new Map(); // studentId -> activities[]
const dailyTests = new Map(); // studentId -> tests[]

class StudentStore {
  static addStudent(studentData) {
    const { id, name, role } = studentData;
    students.set(id, { id, name, role, createdAt: new Date() });
    activities.set(id, []);
    dailyTests.set(id, []);
    return students.get(id);
  }

  static getStudent(id) {
    return students.get(id);
  }

  static getAllStudents() {
    return Array.from(students.values()).filter(user => user.role === 'student');
  }

  static addActivity(studentId, activityData) {
    const studentActivities = activities.get(studentId) || [];
    const activity = {
      id: Date.now().toString(),
      ...activityData,
      timestamp: new Date()
    };
    studentActivities.push(activity);
    activities.set(studentId, studentActivities);
    return activity;
  }

  static getActivities(studentId) {
    return activities.get(studentId) || [];
  }

  static addDailyTest(studentId, testData) {
    const studentTests = dailyTests.get(studentId) || [];
    const test = {
      id: Date.now().toString(),
      ...testData,
      timestamp: new Date(),
      date: new Date().toDateString()
    };
    studentTests.push(test);
    dailyTests.set(studentId, studentTests);
    return test;
  }

  static getDailyTests(studentId) {
    return dailyTests.get(studentId) || [];
  }

  static getTodaysTest(studentId) {
    const tests = dailyTests.get(studentId) || [];
    const today = new Date().toDateString();
    return tests.find(test => test.date === today);
  }

  static getRecentActivities(studentId, days = 7) {
    const allActivities = activities.get(studentId) || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allActivities.filter(activity => new Date(activity.timestamp) > cutoff);
  }
}

module.exports = StudentStore;