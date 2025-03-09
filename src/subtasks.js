document.addEventListener("DOMContentLoaded", () => {
    const subtaskList = document.getElementById("subtask-list");
    const newSubtaskInput = document.getElementById("new-subtask");
    const addSubtaskBtn = document.getElementById("add-subtask");

    // Get the current task ID from storage
    chrome.storage.sync.get("currentTaskId", (data) => {
        if (data.currentTaskId) {
            const taskId = data.currentTaskId;
            // Load subtasks from storage based on the taskId
            chrome.storage.sync.get("subtasks", (subtaskData) => {
                const subtasks = subtaskData[taskId] || [];
                subtasks.forEach(subtask => addSubtaskToUI(subtask.text));
            });
        }
    });

    // Add new subtask
    addSubtaskBtn.addEventListener("click", () => {
        const subtaskText = newSubtaskInput.value.trim();
        if (subtaskText) {
            const taskId = localStorage.getItem("taskId");
            addSubtaskToUI(subtaskText);
            saveSubtasks(taskId);
            newSubtaskInput.value = "";
        }
    });

    function addSubtaskToUI(text) {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        const taskText = document.createElement("span");
        taskText.textContent = text;

        li.appendChild(checkbox);
        li.appendChild(taskText);
        subtaskList.appendChild(li);
    }

    function saveSubtasks(taskId) {
        chrome.storage.sync.get("subtasks", (subtaskData) => {
            let subtasks = subtaskData[taskId] || [];
            const subtaskText = newSubtaskInput.value.trim();
            subtasks.push({ text: subtaskText });
            const updatedData = { ...subtaskData, [taskId]: subtasks };
            chrome.storage.sync.set({ subtasks: updatedData });
        });
    }
});
