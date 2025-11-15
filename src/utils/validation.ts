export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString + "T00:00:00");
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateMinutes(minutes: number): boolean {
  return minutes > 0 && minutes <= 24 * 60; // Max 24 hours
}

export function validateProjectName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= 100;
}

export function extractTags(comment: string): string[] {
  const tagRegex = /#(\w+)/g;
  const matches = comment.match(tagRegex);
  return matches ? matches.map((tag) => tag.substring(1)) : [];
}
