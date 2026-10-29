// due_date chega do backend como 'YYYY-MM-DD' (dateStrings: true).
// Comparamos strings para evitar problemas de fuso horário.
export function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isOverdue(task) {
  return !!task.due_date && !task.completed && task.due_date.slice(0, 10) < todayISO();
}

export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
