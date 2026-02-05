let currentTab: string = "todo";
let activeTaskId: string | null = null;

const dashTotal = document.getElementById("dash-total") as HTMLElement;
const dashTodo = document.getElementById("dash-todo") as HTMLElement;
const dashInprogress = document.getElementById("dash-inprogress") as HTMLElement;
const dashDone = document.getElementById("dash-done") as HTMLElement;
const dashPending = document.getElementById("dash-pending") as HTMLElement;

const reminderPopup = document.getElementById("reminderPopup") as HTMLElement;

const updateTaskBtn = document.getElementById("updateTaskBtn") as HTMLButtonElement;
const deleteTaskBtn = document.getElementById("deleteTaskBtn") as HTMLButtonElement;
const cancelEditBtn = document.getElementById("cancelEditBtn") as HTMLButtonElement;

declare function getTasks(): Task[];
declare function saveTasks(tasks: Task[]): void;
declare function updatePendingTasks(tasks: Task[]): Task[];
declare function calculateProgress(task: Task): number;
declare function getProgressColor(percent: number): string;

function renderTasks(): void {
  let tasks: Task[] = updatePendingTasks(getTasks());
  saveTasks(tasks);

  dashTotal.textContent = String(tasks.length);
  dashTodo.textContent = String(tasks.filter(t => t.status === "todo").length);
  dashInprogress.textContent = String(tasks.filter(t => t.status === "inprogress").length);
  dashDone.textContent = String(tasks.filter(t => t.status === "done").length);
  dashPending.textContent = String(tasks.filter(t => t.status === "pending").length);

  ["todo", "inprogress", "done", "pending"].forEach(status => {
    const el = document.getElementById(`count-${status}`) as HTMLElement;
    el.textContent = `(${tasks.filter(t => t.status === status).length})`;
  });

  const container = document.getElementById("taskContainer") as HTMLElement;
  container.innerHTML = "";

  tasks
    .filter(t => t.status === currentTab)
    .forEach(task => {
      const progress = calculateProgress(task);
      const color = getProgressColor(progress);

      let tagText = "";
      let tagColor = "";

      if (task.tag === "important") {
        tagText = "! Important";
        tagColor = "bg-red-600 text-white";
      } else if (task.tag === "neutral") {
        tagText = "Neutral";
        tagColor = "bg-yellow-400 text-black";
      } else {
        tagText = "General";
        tagColor = "bg-blue-500 text-white";
      }

      container.innerHTML += `
        <tr class="hover:bg-slate-50 border-l-4 ${
          task.tag === "important"
            ? "border-red-500"
            : task.tag === "neutral"
            ? "border-yellow-400"
            : "border-blue-500"
        }">
          <td class="px-4 py-3 font-medium flex items-center gap-2">
            ${task.title}
            <span class="px-2 py-1 rounded text-xs ${tagColor}">${tagText}</span>
          </td>

          <td class="px-4 py-3">
            <div class="bg-gray-200 h-2 rounded">
              <div class="${color} h-2 rounded" style="width:${progress}%"></div>
            </div>
            <span class="text-xs text-gray-500">${Math.floor(progress)}%</span>
          </td>

          <td class="px-4 py-3">
            ${new Date(task.deadline).toLocaleString()}
          </td>

          <td class="px-4 py-3">
            <button
              data-id="${task.id}"
              class="edit-btn text-blue-600 hover:underline">
              Edit
            </button>
          </td>
        </tr>
      `;
    });

  document.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (id) openEditModal(id);
    };
  });
}

function openEditModal(id: string): void {
  const task = getTasks().find(t => t.id === id);
  if (!task) return;

  activeTaskId = id;

  editTitle.value = task.title;
  editDesc.value = task.description;
  editStatus.value = task.status;
  extendTime.value = ""; 

  editModal.classList.remove("hidden");
}

function closeEditModal(): void {
  editModal.classList.add("hidden");
}

function updateTask(): void {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === activeTaskId);
  if (!task) return;

  task.title = editTitle.value;
  task.description = editDesc.value;
  task.status = editStatus.value;

  if (extendTime.value) {
    task.deadline += Number(extendTime.value) * 60 * 1000;
  }

  saveTasks(tasks);
  closeEditModal();
  renderTasks();
}

function deleteCurrentTask(): void {
  saveTasks(getTasks().filter(t => t.id !== activeTaskId));
  closeEditModal();
  renderTasks();
}

updateTaskBtn.onclick = () => updateTask();
deleteTaskBtn.onclick = () => deleteCurrentTask();
cancelEditBtn.onclick = () => closeEditModal();


function showReminder(task: Task): void {
  let tagText = "";
  let tagColor = "";

  if (task.tag === "important") {
    tagText = "! Important";
    tagColor = "bg-red-600 text-white";
  } else if (task.tag === "neutral") {
    tagText = "Neutral";
    tagColor = "bg-yellow-500 text-black";
  } else {
    tagText = "General";
    tagColor = "bg-blue-500 text-white";
  }

  const reminderMessage = `${task.title} is approaching its deadline. Complete it soon!`;

  reminderPopup.innerHTML = `
    <div class="flex justify-between items-start gap-4 w-full max-w-lg px-6 py-4">
      <div>
        <span class="font-bold text-lg">${task.title}</span>
        <span class="ml-2 px-3 py-1 text-sm rounded ${tagColor}">${tagText}</span>
        <div class="text-sm text-gray-500 mt-1">
          Deadline: ${new Date(task.deadline).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>
        <div class="mt-2 text-gray-700 text-sm">
           ${reminderMessage}
        </div>
      </div>
      <button id="closeReminder" class="text-gray-500 font-bold hover:text-gray-700 text-xl">&times;</button>
    </div>
  `;

  reminderPopup.classList.remove("hidden");

  setTimeout(() => {
    reminderPopup.classList.remove("opacity-0", "scale-95");
    reminderPopup.classList.add("opacity-100", "scale-100");
  }, 50);

  (document.getElementById("closeReminder") as HTMLButtonElement).onclick =
    () => hideReminder();

  setTimeout(() => hideReminder(), 10000);
}

function hideReminder(): void {
  reminderPopup.classList.remove("opacity-100", "scale-100");
  reminderPopup.classList.add("opacity-0", "scale-95");

  setTimeout(() => reminderPopup.classList.add("hidden"), 500);
}

setInterval((): void => {
  const tasks = getTasks();
  const now = Date.now();

  tasks.forEach(task => {
    if (!task.reminded && task.status !== "done" && task.status !== "pending") {
      if (task.deadline - now <= 10 * 60 * 1000 && task.deadline - now > 0) {
        showReminder(task);
        task.reminded = true;
        saveTasks(tasks);
      }
    }
  });
}, 5000);
