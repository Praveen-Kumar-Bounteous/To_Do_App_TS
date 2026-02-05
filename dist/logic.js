"use strict";
function calculateProgress(task) {
    const now = Date.now();
    const total = task.deadline - task.createdAt;
    const elapsed = now - task.createdAt;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
}
function getProgressColor(percent) {
    if (percent < 50)
        return "bg-green-500";
    if (percent < 75)
        return "bg-yellow-500";
    return "bg-red-500";
}
function getTagStyles(tag) {
    if (tag === "important")
        return "border-red-500 bg-red-50";
    if (tag === "neutral")
        return "border-yellow-500 bg-yellow-50";
    return "border-blue-500 bg-blue-50";
}
function updatePendingTasks(tasks) {
    const now = Date.now();
    return tasks.map(task => {
        if (task.status !== "done" && now > task.deadline) {
            task.status = "pending";
        }
        return task;
    });
}
