document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const gardenBtn = document.getElementById("garden-btn");
    const newTaskInput = document.getElementById("user-input");

    let tasks = {};
    let nextTaskId = 0;

    function loadTasks() {
        chrome.storage.sync.get("tasks", (data) => {
            taskList.innerHTML = "";

            if (data.tasks) {
                tasks = data.tasks;
                // Get the highest task ID to determine the next ID
                const taskIds = Object.keys(tasks).map(id => parseInt(id));
                nextTaskId = taskIds.length > 0 ? Math.max(...taskIds) + 1 : 0;
                
                // Render each task
                Object.keys(tasks).forEach(taskId => {
                    addTaskToUI(tasks[taskId], taskId);
                });
            }
        });
    }

    loadTasks();

    document.getElementById('add-task').addEventListener('click', async () => {
        const prompt = newTaskInput.value.trim(); 

        if (!prompt) {
            alert('Please enter a prompt.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "main_task": prompt }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('Error:', data.error);
            } else {
                const newTask = data.reply;
                var rand = Math.floor(Math.random() * 3);
                newTask.plant = rand;

                // Add task with a unique ID
                const taskId = nextTaskId.toString();
                tasks[taskId] = newTask;
                nextTaskId++;
                
                addTaskToUI(newTask, taskId);
                saveTasks();
                newTaskInput.value = "";
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    gardenBtn.addEventListener("click", () => {
        window.location.href = "garden.html"; 
    });

    function addTaskToUI(task, taskId) {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => {
            // Update the main task's completed status
            task.completed = checkbox.checked;
            
            // Update all subtasks' completed status to match the main task
            if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks.forEach(subtask => {
                    subtask.completed = checkbox.checked;
                });
            }
            
            saveTasks();
        });

        const taskText = document.createElement("span");
        taskText.textContent = task.main_task;

        const arrowBtn = document.createElement("button");
        arrowBtn.innerHTML = "→";
        arrowBtn.classList.add("task-button", "arrow-btn");
        arrowBtn.title = "View Subtasks";

        arrowBtn.addEventListener("click", () => {
            console.log("Arrow button clicked!");
            console.log("Storing task ID:", taskId);
        
            chrome.storage.sync.set({ currentTaskId: taskId, currentTask: task }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error storing task:", chrome.runtime.lastError);
                } else {
                    console.log("Task saved to chrome storage.");
                    window.location.href = "subtasks.html";
                }
            });
        });
        
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑";
        deleteBtn.classList.add("task-button", "delete-btn");
        deleteBtn.title = "Delete Task";
        deleteBtn.addEventListener("click", () => {
            delete tasks[taskId]; 
            saveTasks();
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(arrowBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    }

    function saveTasks() {
        chrome.storage.sync.set({ tasks });
        loadTasks();
    }
});