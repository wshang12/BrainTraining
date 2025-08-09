export function dayKey(uid: string, key: string) {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return `u:${uid}:d:${y}-${m}-${day}:${key}`;
}

export function weekKey(uid: string, key: string) {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const diffDays = (d.valueOf() - onejan.valueOf()) / 86400000;
  const week = Math.ceil((diffDays + onejan.getDay() + 1) / 7);
  return `u:${uid}:w:${d.getFullYear()}-${week}:${key}`;
}

export const LB_WEEK_KEY = (group: string) => `lb:week:${group}`;