document.addEventListener("DOMContentLoaded", () => {
    const subtaskList = document.getElementById("subtask-list");
    const mainTaskTitle = document.querySelector(".main-task-title");
    const gardenBtn = document.getElementById("garden-btn");

    console.log("Subtasks.js loaded, getting data from storage...");

    // Function to display error messages in the UI for debugging
    function showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.textContent = message;
        errorDiv.style.color = "red";
        errorDiv.style.padding = "10px";
        document.body.appendChild(errorDiv);
        console.error(message);
    }

    // Clear and update the subtask list
    function displaySubtasks(subtasks) {
        subtaskList.innerHTML = '';
        
        if (subtasks && subtasks.length > 0) {
            console.log("Displaying subtasks:", subtasks);
            subtasks.forEach(subtask => {
                const li = document.createElement("li");
                // Remove default bullet styling
                li.style.listStyle = "none";
                // Add some margin for spacing
                li.style.marginBottom = "10px";
                
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = subtask.completed || false;
                checkbox.style.marginRight = "10px";
                checkbox.style.transform = "scale(1.3)"; // Make checkbox a bit larger
                
                const taskText = document.createElement("span");
                taskText.textContent = subtask.task;
                // Make the text larger
                taskText.style.fontSize = "18px";
                
                li.appendChild(checkbox);
                li.appendChild(taskText);
                subtaskList.appendChild(li);
            });
        } else {
            showError("No subtasks found for this task.");
        }
    }

    // Get data from Chrome storage
    chrome.storage.sync.get(["currentTaskId", "currentTask"], (data) => {
        console.log("Data from chrome storage:", data);

        if (data.currentTask) {
            // Update the main task title
            if (mainTaskTitle) {
                mainTaskTitle.textContent = data.currentTask.main_task;
                console.log("Updated main task title:", data.currentTask.main_task);
            } else {
                showError("Main task title element not found.");
            }

            // Display subtasks
            if (data.currentTask.subtasks) {
                displaySubtasks(data.currentTask.subtasks);
            } else {
                showError("No subtasks found in the current task data.");
            }
        } else {
            showError("No current task found in chrome storage.");
        }
    });

    gardenBtn.addEventListener("click", () => {
        window.location.href = "garden.html"; 
    });
});