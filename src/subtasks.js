document.addEventListener("DOMContentLoaded", () => {
    const subtaskList = document.getElementById("subtask-list");
    const mainTaskTitle = document.querySelector(".main-task-title");
    const gardenBtn = document.getElementById("garden-btn");
    const logoBtn = document.getElementById("logo-btn");
    const leftArrow = document.querySelector(".arrow.left");
    const rightArrow = document.querySelector(".arrow.right");
    const plantImage = document.querySelector(".plant-image img");
    
    // Variables to track current task and all tasks
    let currentTaskId = 0;
    let allTasks = [];
    let currentTask = null;

    console.log("Subtasks.js loaded, getting data from storage...");

    function showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.textContent = message;
        errorDiv.style.color = "red";
        errorDiv.style.padding = "10px";
        document.body.appendChild(errorDiv);
        console.error(message);
    }

    function displaySubtasks(subtasks) {
        subtaskList.innerHTML = '';
        
        if (subtasks && subtasks.length > 0) {
            console.log("Displaying subtasks:", subtasks);
            subtasks.forEach((subtask, index) => {
                const li = document.createElement("li");
                
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = subtask.completed || false;
                
                // Add event listener to update the completion status
                checkbox.addEventListener("change", () => {
                    subtask.completed = checkbox.checked;
                    updateTaskInStorage();
                    
                    // Update the plant image based on progress
                    updatePlantImage();
                });
                
                const taskText = document.createElement("span");
                taskText.textContent = subtask.task;
                
                li.appendChild(checkbox);
                li.appendChild(taskText);
                subtaskList.appendChild(li);
            });
        } else {
            showError("No subtasks found for this task.");
        }
    }

    function updatePlantImage() {
        if (!currentTask) return;
        
        // Calculate plant stage based on subtask completion
        const completedSubtasks = currentTask.subtasks.filter(subtask => subtask.completed).length;
        const totalSubtasks = currentTask.subtasks.length;
        const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;
        
        let plantStage = 0;
        if (progress === 0) plantStage = 0;
        else if (progress <= 0.25) plantStage = 0;
        else if (progress <= 0.5) plantStage = 1;
        else if (progress <= 0.75) plantStage = 2;
        else plantStage = 3; // 100% completed
        
        // Update the plant image
        if (plantStage === 0) {
            plantImage.src = "img/sprout_0.png";
        } else {
            const plantType = currentTask.plant;
            plantImage.src = `img/plant${plantType}-stage${plantStage}.png`;
        }
    }

    function updateTaskInStorage() {
        // Update the current task in allTasks array
        allTasks[currentTaskId] = currentTask;
        
        // Save all tasks back to storage
        chrome.storage.sync.set({ 
            tasks: allTasks,
            currentTaskId: currentTaskId,
            currentTask: currentTask
        });
    }

    function loadTask(taskId) {
        if (taskId >= 0 && taskId < allTasks.length) {
            currentTaskId = taskId;
            currentTask = allTasks[taskId];
            
            // Update the UI
            mainTaskTitle.textContent = currentTask.main_task;
            displaySubtasks(currentTask.subtasks);
            updatePlantImage();
            
            // Save current task ID to storage
            chrome.storage.sync.set({ 
                currentTaskId: currentTaskId,
                currentTask: currentTask
            });
        }
    }

    // Load all tasks first
    chrome.storage.sync.get("tasks", (data) => {
        if (data.tasks && data.tasks.length > 0) {
            allTasks = data.tasks;
            
            // Then get the current task ID
            chrome.storage.sync.get(["currentTaskId", "currentTask"], (taskData) => {
                currentTaskId = taskData.currentTaskId || 0;
                
                // Make sure currentTaskId is within bounds
                if (currentTaskId >= allTasks.length) {
                    currentTaskId = 0;
                }
                
                currentTask = allTasks[currentTaskId];
                
                // Update the UI
                if (currentTask) {
                    mainTaskTitle.textContent = currentTask.main_task;
                    displaySubtasks(currentTask.subtasks);
                    updatePlantImage();
                } else {
                    showError("Failed to load the current task.");
                }
            });
        } else {
            showError("No tasks found in storage.");
        }
    });

    // Event listeners for arrow navigation
    leftArrow.addEventListener("click", () => {
        if (allTasks.length > 0) {
            let prevTaskId = currentTaskId - 1;
            if (prevTaskId < 0) {
                prevTaskId = allTasks.length - 1; // Wrap around to the last task
            }
            loadTask(prevTaskId);
        }
    });

    rightArrow.addEventListener("click", () => {
        if (allTasks.length > 0) {
            let nextTaskId = currentTaskId + 1;
            if (nextTaskId >= allTasks.length) {
                nextTaskId = 0; // Wrap around to the first task
            }
            loadTask(nextTaskId);
        }
    });

    // Garden button navigation
    gardenBtn.addEventListener("click", () => {
        window.location.href = "garden.html"; 
    });

    // Logo button navigation to popup.html
    if (logoBtn) {
        logoBtn.addEventListener("click", () => {
            window.location.href = "popup.html";
        });
    } else {
        console.error("Logo button not found.");
    }
});