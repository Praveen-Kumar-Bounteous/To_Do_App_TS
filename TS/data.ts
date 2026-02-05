const STORAGE_KEY = "tasks";

function getTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? (JSON.parse(data) as Task[]) : [];
}

function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
