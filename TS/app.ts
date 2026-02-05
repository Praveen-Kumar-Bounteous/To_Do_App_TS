const addTaskBtn = document.getElementById("addTaskBtn") as HTMLButtonElement;
const taskModal = document.getElementById("taskModal") as HTMLElement;
const closeModal = document.getElementById("closeModal") as HTMLButtonElement;
const saveTask = document.getElementById("saveTask") as HTMLButtonElement;

const title = document.getElementById("title") as HTMLInputElement;
const description = document.getElementById("description") as HTMLTextAreaElement;
const tag = document.getElementById("tag") as HTMLSelectElement;
const deadline = document.getElementById("deadline") as HTMLInputElement;

const editModal = document.getElementById("editModal") as HTMLElement;
const editTitle = document.getElementById("editTitle") as HTMLInputElement;
const editDesc = document.getElementById("editDesc") as HTMLTextAreaElement;
const editStatus = document.getElementById("editStatus") as HTMLSelectElement;
const extendTime = document.getElementById("extendTime") as HTMLInputElement;

interface Task {
  id: string;
  title: string;
  description: string;
  tag: string;
  status: string;
  createdAt: number;
  deadline: number;
  reminded: boolean;
}

declare function getTasks(): Task[];
declare function saveTasks(tasks: Task[]): void;
declare function renderTasks(): void;

addTaskBtn.onclick = (): void => {
  title.value = "";
  description.value = "";
  tag.value = "important";
  deadline.value = "";

  taskModal.classList.remove("hidden");
};

closeModal.onclick = (): void => {
  taskModal.classList.add("hidden");
};

saveTask.onclick = (): void => {
  const tasks: Task[] = getTasks();

  tasks.push({
    id: Date.now().toString(),
    title: title.value,
    description: description.value,
    tag: tag.value,
    status: "todo",
    createdAt: Date.now(),
    deadline: new Date(deadline.value).getTime(),
    reminded: false
  });

  saveTasks(tasks);
  taskModal.classList.add("hidden");
  renderTasks();
};

document.querySelectorAll<HTMLButtonElement>(".tab-btn").forEach(btn => {
  btn.onclick = (): void => {
    currentTab = btn.dataset.status as string;
    renderTasks();
  };
});

setInterval((): void => {
  const now = Date.now();
  const tasks: Task[] = getTasks();

  tasks.forEach(task => {
    if (
      !task.reminded &&
      task.deadline - now <= 5 * 60 * 1000 &&
      task.deadline > now
    ) {
      reminderPopup.textContent =
        `${task.title} due at ${new Date(task.deadline).toLocaleTimeString()}`;

      reminderPopup.classList.remove("hidden");

      setTimeout(() => {
        reminderPopup.classList.add("hidden");
      }, 5000);

      task.reminded = true;
      saveTasks(tasks);
    }
  });
}, 30000);

renderTasks();