// In-memory storage for topics
const topics = new Set([
  'Mathematics',
  'Science',
  'History',
  'Literature',
  'Programming',
  'Physics',
  'Chemistry',
  'Biology'
]);

class TopicStore {
  static getAllTopics() {
    return Array.from(topics);
  }

  static addTopic(topicName) {
    if (topicName && topicName.trim()) {
      topics.add(topicName.trim());
      return true;
    }
    return false;
  }

  static topicExists(topicName) {
    return topics.has(topicName);
  }
}

module.exports = TopicStore;