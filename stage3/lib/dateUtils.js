/**
 * Formats a timestamp into human-readable relative time or date
 */
export function formatMessageTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Groups an array of conversations by their creation or update date
 */
export function groupConversationsByDate(conversations = []) {
  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOf7Days = startOfToday - 6 * 86400000;
  const startOf30Days = startOfToday - 29 * 86400000;

  conversations.forEach((conv) => {
    const timestamp = new Date(conv.updatedAt || conv.createdAt || Date.now()).getTime();

    if (timestamp >= startOfToday) {
      groups.Today.push(conv);
    } else if (timestamp >= startOfYesterday) {
      groups.Yesterday.push(conv);
    } else if (timestamp >= startOf7Days) {
      groups['Previous 7 Days'].push(conv);
    } else if (timestamp >= startOf30Days) {
      groups['Previous 30 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  return groups;
}
