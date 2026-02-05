"use strict";
let currentTab = "todo";
let activeTaskId = null;
// Dashboard elements
const dashTotal = document.getElementById("dash-total");
const dashTodo = document.getElementById("dash-todo");
const dashInprogress = document.getElementById("dash-inprogress");
const dashDone = document.getElementById("dash-done");
const dashPending = document.getElementById("dash-pending");
const reminderPopup = document.getElementById("reminderPopup");
// Edit modal elements
// const editTitle = document.getElementById("editTitle") as HTMLInputElement;
// const editDesc = document.getElementById("editDesc") as HTMLTextAreaElement;
// const editStatus = document.getElementById("editStatus") as HTMLSelectElement;
// const extendTime = document.getElementById("extendTime") as HTMLSelectElement;
// const editModal = document.getElementById("editModal") as HTMLElement;
const updateTaskBtn = document.getElementById("updateTaskBtn");
const deleteTaskBtn = document.getElementById("deleteTaskBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
// ---------------- RENDER TASKS ----------------
function renderTasks() {
    let tasks = updatePendingTasks(getTasks());
    saveTasks(tasks);
    dashTotal.textContent = String(tasks.length);
    dashTodo.textContent = String(tasks.filter(t => t.status === "todo").length);
    dashInprogress.textContent = String(tasks.filter(t => t.status === "inprogress").length);
    dashDone.textContent = String(tasks.filter(t => t.status === "done").length);
    dashPending.textContent = String(tasks.filter(t => t.status === "pending").length);
    ["todo", "inprogress", "done", "pending"].forEach(status => {
        const el = document.getElementById(`count-${status}`);
        el.textContent = `(${tasks.filter(t => t.status === status).length})`;
    });
    const container = document.getElementById("taskContainer");
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
        }
        else if (task.tag === "neutral") {
            tagText = "Neutral";
            tagColor = "bg-yellow-400 text-black";
        }
        else {
            tagText = "General";
            tagColor = "bg-blue-500 text-white";
        }
        container.innerHTML += `
        <tr class="hover:bg-slate-50 border-l-4 ${task.tag === "important"
            ? "border-red-500"
            : task.tag === "neutral"
                ? "border-yellow-400"
                : "border-blue-500"}">
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
    // ---------------- Attach Edit buttons dynamically ----------------
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            if (id)
                openEditModal(id);
        };
    });
}
// ---------------- EDIT MODAL FUNCTIONS ----------------
function openEditModal(id) {
    const task = getTasks().find(t => t.id === id);
    if (!task)
        return;
    activeTaskId = id;
    editTitle.value = task.title;
    editDesc.value = task.description;
    editStatus.value = task.status;
    extendTime.value = ""; // reset extend time
    editModal.classList.remove("hidden");
}
function closeEditModal() {
    editModal.classList.add("hidden");
}
function updateTask() {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === activeTaskId);
    if (!task)
        return;
    task.title = editTitle.value;
    task.description = editDesc.value;
    task.status = editStatus.value;
    // Add extend time in minutes if selected
    if (extendTime.value) {
        task.deadline += Number(extendTime.value) * 60 * 1000;
    }
    saveTasks(tasks);
    closeEditModal();
    renderTasks();
}
function deleteCurrentTask() {
    saveTasks(getTasks().filter(t => t.id !== activeTaskId));
    closeEditModal();
    renderTasks();
}
// ---------------- EDIT MODAL BUTTONS ----------------
updateTaskBtn.onclick = () => updateTask();
deleteTaskBtn.onclick = () => deleteCurrentTask();
cancelEditBtn.onclick = () => closeEditModal();
// ---------------- REMINDERS ----------------
function showReminder(task) {
    let tagText = "";
    let tagColor = "";
    if (task.tag === "important") {
        tagText = "! Important";
        tagColor = "bg-red-600 text-white";
    }
    else if (task.tag === "neutral") {
        tagText = "Neutral";
        tagColor = "bg-yellow-500 text-black";
    }
    else {
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
          ⏰ ${reminderMessage}
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
    document.getElementById("closeReminder").onclick =
        () => hideReminder();
    setTimeout(() => hideReminder(), 10000);
}
function hideReminder() {
    reminderPopup.classList.remove("opacity-100", "scale-100");
    reminderPopup.classList.add("opacity-0", "scale-95");
    setTimeout(() => reminderPopup.classList.add("hidden"), 500);
}
// ---------- PERIODIC CHECK FOR REMINDERS ----------
setInterval(() => {
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
