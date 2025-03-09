document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const gardenBtn = document.getElementById("garden-btn");
    const newTaskInput = document.getElementById("user-input");

    let tasks = [];

    function loadTasks() {
        chrome.storage.sync.get("tasks", (data) => {
            taskList.innerHTML = "";

            if (data.tasks) {
                tasks = data.tasks;
                tasks.forEach((task, index) => addTaskToUI(task, index));
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
                console.error('Error:', error);
            } else {
                const newTask = data.reply;
                var rand = Math.floor(Math.random() * 3);
                newTask.plant = rand;

                tasks.push(newTask);
                addTaskToUI(newTask, tasks.length - 1);
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

    function addTaskToUI(task, index) {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            loadTasks();
        });

        const taskText = document.createElement("span");
        taskText.textContent = task.main_task;

        const arrowBtn = document.createElement("button");
        arrowBtn.innerHTML = "→";
        arrowBtn.classList.add("task-button", "arrow-btn");
        arrowBtn.title = "View Subtasks";

        arrowBtn.addEventListener("click", () => {
            console.log("Arrow button clicked!");
            console.log("Storing task:", task);
        
            chrome.storage.sync.set({ currentTaskId: index, currentTask: task }, () => {
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
            tasks.splice(index, 1); 
            saveTasks();
            loadTasks();
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