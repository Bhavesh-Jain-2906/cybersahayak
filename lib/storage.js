const CONVERSATIONS_STORAGE_KEY = 'connor_conversations_v1';
const ACTIVE_CONV_STORAGE_KEY = 'connor_active_conv_v1';
const THEME_STORAGE_KEY = 'connor_theme_v1';

export function getStoredConversations() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load conversations from localStorage:', error);
    return [];
  }
}

export function saveStoredConversations(conversations) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations to localStorage:', error);
  }
}

export function getStoredActiveId() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_CONV_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveStoredActiveId(id) {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CONV_STORAGE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_CONV_STORAGE_KEY);
    }
  } catch {}
}

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  } catch {
    return 'dark';
  }
}

export function saveStoredTheme(theme) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}
