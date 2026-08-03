export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKS = [1, 2, 3, 4, 5];

export const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

export const WEEK_OPTIONS = [{ value: "", label: "All Weeks" }, ...WEEKS.map((w) => ({ value: String(w), label: `Week ${w}` }))];

export const MONTH_OPTIONS = [{ value: "", label: "All Months" }, ...MONTHS.map((m) => ({ value: m, label: m }))];
