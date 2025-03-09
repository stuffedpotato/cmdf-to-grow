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

    // Function to check if all subtasks are completed
    function checkAllSubtasksCompleted() {
        if (!currentTaskData || !currentTaskData.subtasks || currentTaskData.subtasks.length === 0) {
            return false;
        }
        
        return currentTaskData.subtasks.every(subtask => subtask.completed);
    }

    // Function to update subtask completion status
    function updateSubtaskStatus(index, completed) {
        if (currentTaskData && currentTaskData.subtasks) {
            currentTaskData.subtasks[index].completed = completed;
            
            // Update main task checkbox if all subtasks are completed
            if (checkAllSubtasksCompleted()) {
                mainTaskCheckbox.checked = true;
                currentTaskData.completed = true;
            } else {
                mainTaskCheckbox.checked = false;
                currentTaskData.completed = false;
            }
            
            // Save updated data to storage
            chrome.storage.sync.get(["currentTaskId", "tasks"], (storageData) => {
                const taskId = storageData.currentTaskId;
                const tasks = storageData.tasks;
                
                if (tasks && tasks[taskId]) {
                    tasks[taskId].subtasks = currentTaskData.subtasks;
                    tasks[taskId].completed = currentTaskData.completed;
                    
                    chrome.storage.sync.set({ 
                        tasks: tasks,
                        currentTask: currentTaskData 
                    }, () => {
                        console.log("Task data updated in storage");
                    });
                }
            });
        }
    }

    function displaySubtasks(subtasks) {
        subtaskList.innerHTML = '';
        
        if (subtasks && subtasks.length > 0) {
            console.log("Displaying subtasks:", subtasks);
            subtasks.forEach((subtask, index) => {
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

    // Function to update arrow visibility based on current position
    // Function to update arrow visibility based on current position
function updateArrowVisibility() {
    chrome.storage.sync.get(["currentTaskId", "tasks"], (data) => {
        const currentId = data.currentTaskId;
        const tasks = data.tasks;
        
        if (!tasks) {
            console.error("No tasks found when updating arrow visibility");
            return;
        }
        
        const taskIds = Object.keys(tasks);
        const currentIndex = taskIds.indexOf(currentId);
        const totalTasks = taskIds.length;
        
        console.log("Arrow visibility check: Current index", currentIndex, "of", totalTasks, "tasks");
        
        // Handle left arrow (previous)
        if (leftArrow) {
            if (currentIndex <= 0) {
                console.log("Hiding left arrow (first item)");
                // Set both visibility and opacity to ensure it's hidden
                leftArrow.style.visibility = "hidden";
                leftArrow.style.opacity = "0";
            } else {
                console.log("Showing left arrow (not first item)");
                // Make sure both visibility and opacity are set to make it visible
                leftArrow.style.visibility = "visible";
                leftArrow.style.opacity = "1";
            }
        } else {
            console.error("Left arrow element not found during visibility update");
        }
        
        // Handle right arrow (next)
        if (rightArrow) {
            if (currentIndex >= taskIds.length - 1) {
                console.log("Hiding right arrow (last item)");
                // Set both visibility and opacity to ensure it's hidden
                rightArrow.style.visibility = "hidden";
                rightArrow.style.opacity = "0";
            } else {
                console.log("Showing right arrow (not last item)");
                // Make sure both visibility and opacity are set to make it visible
                rightArrow.style.visibility = "visible";
                rightArrow.style.opacity = "1";
            }
        } else {
            console.error("Right arrow element not found during visibility update");
        }
    });
}

    // Function to navigate to previous task
    function navigateToPrevTask() {
        chrome.storage.sync.get(["currentTaskId", "tasks"], (data) => {
            const currentId = data.currentTaskId;
            const tasks = data.tasks;
            
            if (!tasks) {
                console.log("No tasks found in storage");
                return;
            }
            
            // Get all task IDs
            const taskIds = Object.keys(tasks);
            // Find the index of the current task
            const currentIndex = taskIds.indexOf(currentId);
            
            console.log("Current task index:", currentIndex);
            
            // If there's a previous task, navigate to it
            if (currentIndex > 0) {
                const prevTaskId = taskIds[currentIndex - 1];
                
                console.log("Navigating to previous task:", prevTaskId);
                
                // Update current task ID and data
                chrome.storage.sync.set({
                    currentTaskId: prevTaskId,
                    currentTask: tasks[prevTaskId]
                }, () => {
                    // Reload the page to display the new task
                    window.location.reload();
                });
            } else {
                console.log("Already at the first task");
            }
        });
    }
    
    // Function to navigate to next task
    function navigateToNextTask() {
        chrome.storage.sync.get(["currentTaskId", "tasks"], (data) => {
            const currentId = data.currentTaskId;
            const tasks = data.tasks;
            
            if (!tasks) {
                console.log("No tasks found in storage");
                return;
            }
            
            // Get all task IDs
            const taskIds = Object.keys(tasks);
            // Find the index of the current task
            const currentIndex = taskIds.indexOf(currentId);
            
            console.log("Current task index:", currentIndex);
            
            // If there's a next task, navigate to it
            if (currentIndex < taskIds.length - 1) {
                const nextTaskId = taskIds[currentIndex + 1];
                
                console.log("Navigating to next task:", nextTaskId);
                
                // Update current task ID and data
                chrome.storage.sync.set({
                    currentTaskId: nextTaskId,
                    currentTask: tasks[nextTaskId]
                }, () => {
                    // Reload the page to display the new task
                    window.location.reload();
                });
            } else {
                console.log("Already at the last task");
            }
        });
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
        
        // Update arrow visibility after loading task data
        updateArrowVisibility();
    });

    // Add event listeners to arrow buttons
    if (leftArrow) {
        leftArrow.addEventListener("click", navigateToPrevTask);
        // Add pointer cursor to indicate it's clickable
        leftArrow.style.cursor = "pointer";
        console.log("Left arrow click listener added");
    } else {
        console.error("Left arrow element not found");
    }
    
    if (rightArrow) {
        rightArrow.addEventListener("click", navigateToNextTask);
        // Add pointer cursor to indicate it's clickable
        rightArrow.style.cursor = "pointer";
        console.log("Right arrow click listener added");
    } else {
        console.error("Right arrow element not found");
    }

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