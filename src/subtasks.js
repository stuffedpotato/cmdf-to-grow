document.addEventListener("DOMContentLoaded", () => {
    const subtaskList = document.getElementById("subtask-list");
    const newSubtaskInput = document.getElementById("new-subtask");
    const addSubtaskBtn = document.getElementById("add-subtask");

    addSubtaskBtn.addEventListener("click", () => {
        const subtaskText = newSubtaskInput.value.trim();
        if (subtaskText) {
            const li = document.createElement("li");
            li.textContent = subtaskText;
            subtaskList.appendChild(li);
            newSubtaskInput.value = "";
        }
    });
});
