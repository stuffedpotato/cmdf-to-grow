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
    let allTasks = {};
    let currentTask = null;

    console.log("Subtasks.js loaded, getting data from storage...");
    
    // Debug function to check arrow elements
    function debugArrows() {
        const leftArrow = document.querySelector(".arrow.left");
        const rightArrow = document.querySelector(".arrow.right");
        
        console.log("Left arrow exists:", !!leftArrow);
        console.log("Right arrow exists:", !!rightArrow);
        
        if (leftArrow) {
            console.log("Left arrow computed style:", 
                window.getComputedStyle(leftArrow).visibility,
                window.getComputedStyle(leftArrow).opacity);
        }
        
        if (rightArrow) {
            console.log("Right arrow computed style:", 
                window.getComputedStyle(rightArrow).visibility,
                window.getComputedStyle(rightArrow).opacity);
        }
    }
    
    // Call debug function after a short delay
    setTimeout(debugArrows, 500);

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
        if (!currentTask || !currentTask.subtasks || currentTask.subtasks.length === 0) {
            return false;
        }
        
        return currentTask.subtasks.every(subtask => subtask.completed);
    }

    // Function to update main task completion based on subtasks
    function updateMainTaskCompletion() {
        if (!currentTask || !currentTask.subtasks) return;
        
        // Update main task completion status based on all subtasks
        currentTask.completed = checkAllSubtasksCompleted();
        
        // Save to storage
        updateTaskInStorage();
    }

    // Function to display subtasks
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
                    updateMainTaskCompletion();
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
                    leftArrow.classList.add("arrow-hidden");
                    leftArrow.classList.remove("arrow-visible");
                } else {
                    console.log("Showing left arrow (not first item)");
                    leftArrow.classList.add("arrow-visible");
                    leftArrow.classList.remove("arrow-hidden");
                }
            } else {
                console.error("Left arrow element not found during visibility update");
            }
            
            // Handle right arrow (next)
            if (rightArrow) {
                if (currentIndex >= taskIds.length - 1) {
                    console.log("Hiding right arrow (last item)");
                    rightArrow.classList.add("arrow-hidden");
                    rightArrow.classList.remove("arrow-visible");
                } else {
                    console.log("Showing right arrow (not last item)");
                    rightArrow.classList.add("arrow-visible");
                    rightArrow.classList.remove("arrow-hidden");
                }
            } else {
                console.error("Right arrow element not found during visibility update");
            }
        });
    }

    // Function to navigate to previous task
    function navigateToPrevTask() {
        console.log("Left arrow clicked, trying to navigate to prev task");
        chrome.storage.sync.get(["currentTaskId", "tasks"], (data) => {
            const currentId = data.currentTaskId;
            const tasks = data.tasks;
            
            if (!tasks) {
                console.log("No tasks found in storage");
                return;
            }
            
            // Get all task IDs
            const taskIds = Object.keys(tasks);
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
                    window.location.reload();
                });
            } else {
                console.log("Already at the first task");
            }
        });
    }
    
    // Function to navigate to next task
    function navigateToNextTask() {
        console.log("Right arrow clicked, trying to navigate to next task");
        chrome.storage.sync.get(["currentTaskId", "tasks"], (data) => {
            const currentId = data.currentTaskId;
            const tasks = data.tasks;
            
            if (!tasks) {
                console.log("No tasks found in storage");
                return;
            }
            
            const taskIds = Object.keys(tasks);
            const currentIndex = taskIds.indexOf(currentId);
            
            console.log("Current task index:", currentIndex);
            
            if (currentIndex < taskIds.length - 1) {
                const nextTaskId = taskIds[currentIndex + 1];
                
                console.log("Navigating to next task:", nextTaskId);
                
                chrome.storage.sync.set({
                    currentTaskId: nextTaskId,
                    currentTask: tasks[nextTaskId]
                }, () => {
                    window.location.reload();
                });
            } else {
                console.log("Already at the last task");
            }
        });
    }

    function updatePlantImage() {
        if (!currentTask) return;
        
        const completedSubtasks = currentTask.subtasks.filter(subtask => subtask.completed).length;
        const totalSubtasks = currentTask.subtasks.length;
        const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;
        
        let plantStage = 0;
        if (progress === 0) plantStage = 0;
        else if (progress <= 0.25) plantStage = 0;
        else if (progress <= 0.5) plantStage = 1;
        else if (progress <= 0.75) plantStage = 2;
        else plantStage = 3;
        
        if (plantStage === 0) {
            plantImage.src = "img/sprout_0.png";
        } else {
            const plantType = currentTask.plant;
            plantImage.src = `img/plant${plantType}-stage${plantStage}.png`;
        }
    }

    // Modify the updateTaskInStorage function to use consistent object notation
    function updateTaskInStorage() {
        // Make sure allTasks is an object, not an array
        if (!allTasks) allTasks = {};
        
        allTasks[currentTaskId] = currentTask;
        
        chrome.storage.sync.set({ 
            tasks: allTasks,
            currentTaskId: currentTaskId,
            currentTask: currentTask
        });
    }

    // Update the loadTask function to handle object structure
    function loadTask(taskId) {
        if (allTasks && allTasks[taskId]) {
            currentTaskId = taskId;
            currentTask = allTasks[taskId];
            
            mainTaskTitle.textContent = currentTask.main_task;
            displaySubtasks(currentTask.subtasks);
            updatePlantImage();
            
            chrome.storage.sync.set({ 
                currentTaskId: currentTaskId,
                currentTask: currentTask
            });
        }
    }

    // Update the initial loading section
    chrome.storage.sync.get("tasks", (data) => {
        if (data.tasks && Object.keys(data.tasks).length > 0) {
            allTasks = data.tasks;
            
            chrome.storage.sync.get(["currentTaskId", "currentTask"], (taskData) => {
                currentTaskId = taskData.currentTaskId || Object.keys(allTasks)[0];
                
                currentTask = allTasks[currentTaskId];
                
                if (currentTask) {
                    mainTaskTitle.textContent = currentTask.main_task;
                    displaySubtasks(currentTask.subtasks);
                    updatePlantImage();
                    
                    // Setup arrow navigation after tasks are loaded
                    setupArrowNavigation();
                } else {
                    showError("Failed to load the current task.");
                }
            });
        } else {
            showError("No tasks found in storage.");
        }
    });

    // Separate function to set up arrow navigation
    function setupArrowNavigation() {
        // Get fresh references to the arrows
        const leftArrow = document.querySelector(".arrow.left");
        const rightArrow = document.querySelector(".arrow.right");
        
        console.log("Setting up arrow navigation. Left arrow:", leftArrow, "Right arrow:", rightArrow);
        
        if (leftArrow) {
            leftArrow.addEventListener("click", navigateToPrevTask);
            leftArrow.style.cursor = "pointer";
            console.log("Left arrow click listener added");
        } else {
            console.error("Left arrow element not found");
        }
        
        if (rightArrow) {
            rightArrow.addEventListener("click", navigateToNextTask);
            rightArrow.style.cursor = "pointer";
            console.log("Right arrow click listener added");
        } else {
            console.error("Right arrow element not found");
        }
        
        // Update arrow visibility after setting up listeners
        updateArrowVisibility();
    }

    gardenBtn.addEventListener("click", () => {
        window.location.href = "garden.html"; 
    });

    if (logoBtn) {
        logoBtn.addEventListener("click", () => {
            window.location.href = "popup.html";
        });
    } else {
        console.error("Logo button not found.");
    }
});