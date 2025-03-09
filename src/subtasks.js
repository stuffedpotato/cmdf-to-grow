document.addEventListener("DOMContentLoaded", () => {
    const subtaskList = document.getElementById("subtask-list");
    const mainTaskTitle = document.querySelector(".main-task-title");
    const gardenBtn = document.getElementById("garden-btn");
    const leftArrow = document.querySelector(".arrow.left");
    const rightArrow = document.querySelector(".arrow.right");
    let mainTaskCheckbox; // Store reference to main checkbox
    let currentTaskData; // Store reference to current task data

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

    // Clear and update the subtask list
    function displaySubtasks(subtasks) {
        subtaskList.innerHTML = '';
        
        if (subtasks && subtasks.length > 0) {
            console.log("Displaying subtasks:", subtasks);
            subtasks.forEach((subtask, index) => {
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
                
                // Add event listener for subtask checkbox
                checkbox.addEventListener("change", () => {
                    updateSubtaskStatus(index, checkbox.checked);
                });
                
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

    // Get data from Chrome storage
    chrome.storage.sync.get(["currentTaskId", "currentTask"], (data) => {
        console.log("Data from chrome storage:", data);
        currentTaskData = data.currentTask; // Store the current task data

        if (currentTaskData) {
            // Update the main task title with checkbox
            if (mainTaskTitle) {
                // Create a container for the main task
                const mainTaskContainer = document.createElement("div");
                mainTaskContainer.style.marginBottom = "20px";
                
                // Create checkbox for main task
                mainTaskCheckbox = document.createElement("input");
                mainTaskCheckbox.type = "checkbox";
                mainTaskCheckbox.id = "main-task-checkbox";
                mainTaskCheckbox.checked = currentTaskData.completed || false;
                mainTaskCheckbox.style.marginRight = "10px";
                mainTaskCheckbox.style.transform = "scale(1.5)"; // Make it slightly larger than subtask checkboxes
                
                // Add event listener to update the task completion status
                mainTaskCheckbox.addEventListener("change", () => {
                    currentTaskData.completed = mainTaskCheckbox.checked;
                    
                    // Update all subtasks to match main task checkbox
                    if (currentTaskData.subtasks) {
                        currentTaskData.subtasks.forEach(subtask => {
                            subtask.completed = mainTaskCheckbox.checked;
                        });
                        
                        // Redisplay subtasks with updated status
                        displaySubtasks(currentTaskData.subtasks);
                    }
                    
                    // Update storage
                    chrome.storage.sync.get(["currentTaskId", "tasks"], (storageData) => {
                        const taskId = storageData.currentTaskId;
                        const tasks = storageData.tasks;
                        
                        if (tasks && tasks[taskId]) {
                            tasks[taskId].completed = mainTaskCheckbox.checked;
                            tasks[taskId].subtasks = currentTaskData.subtasks;
                            
                            chrome.storage.sync.set({ 
                                tasks: tasks,
                                currentTask: currentTaskData 
                            }, () => {
                                console.log("Main task and all subtasks updated:", mainTaskCheckbox.checked);
                            });
                        }
                    });
                });
                
                // Create the text element for the main task
                const mainTaskText = document.createElement("span");
                mainTaskText.textContent = currentTaskData.main_task;
                mainTaskText.style.fontSize = "22px";
                mainTaskText.style.fontWeight = "bold";
                
                // Clear the mainTaskTitle and append the new elements
                mainTaskTitle.innerHTML = '';
                mainTaskContainer.appendChild(mainTaskCheckbox);
                mainTaskContainer.appendChild(mainTaskText);
                mainTaskTitle.appendChild(mainTaskContainer);
                
                console.log("Updated main task title with checkbox:", currentTaskData.main_task);
            } else {
                showError("Main task title element not found.");
            }

            // Display subtasks
            if (currentTaskData.subtasks) {
                displaySubtasks(currentTaskData.subtasks);
            } else {
                showError("No subtasks found in the current task data.");
            }
        } else {
            showError("No current task found in chrome storage.");
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

    gardenBtn.addEventListener("click", () => {
        window.location.href = "garden.html"; 
    });
});