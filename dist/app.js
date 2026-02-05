"use strict";
// DOM Elements
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const saveTask = document.getElementById("saveTask");
const title = document.getElementById("title");
const description = document.getElementById("description");
const tag = document.getElementById("tag");
const deadline = document.getElementById("deadline");
const editModal = document.getElementById("editModal");
const editTitle = document.getElementById("editTitle");
const editDesc = document.getElementById("editDesc");
const editStatus = document.getElementById("editStatus");
const extendTime = document.getElementById("extendTime");
// Event handlers
addTaskBtn.onclick = () => {
    title.value = "";
    description.value = "";
    tag.value = "important";
    deadline.value = "";
    taskModal.classList.remove("hidden");
};
closeModal.onclick = () => {
    taskModal.classList.add("hidden");
};
saveTask.onclick = () => {
    const tasks = getTasks();
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
// Tabs
document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.onclick = () => {
        currentTab = btn.dataset.status;
        renderTasks();
    };
});
// Reminder checker
setInterval(() => {
    const now = Date.now();
    const tasks = getTasks();
    tasks.forEach(task => {
        if (!task.reminded &&
            task.deadline - now <= 5 * 60 * 1000 &&
            task.deadline > now) {
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
// Initial render
renderTasks();
