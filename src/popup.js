document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const newTaskInput = document.getElementById("new-task");
    const addPlantBtn = document.getElementById("add-plant");
    const gardenBtn = document.getElementById("garden-btn"); // Get the "My Garden" button

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
            const response = await fetch('http://localhost:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ main_task: prompt }),
            });

            const data = await response.json();

            if (data.error) {
                //TODO: Error handling
                console.error('Error:', error);

            } else {
                const newTask = data.reply;
                tasks.push(newTask)
                addTaskToUI(prompt, false);
                saveTasks();
                newTaskInput.value = "";
                console.log(tasks);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Add event listener to the "My Garden" button to navigate to garden.html
    gardenBtn.addEventListener("click", () => {
        window.location.href = "garden.html"; // Redirect to garden.html
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
        arrowBtn.textContent = "→";
        arrowBtn.classList.add("arrow-btn");
        arrowBtn.addEventListener("click", () => {
            chrome.storage.sync.set({ currentTaskIndex: index }, () => {
                window.location.href = "subtasks.html";
            });
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => {
            tasks.splice(index, 1); // Remove from array
            saveTasks();
            loadTasks(); // Reload UI after deletion
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(arrowBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    }

    function saveTasks() {
        chrome.storage.sync.set({ tasks }, loadTasks); // Save and reload UI
    }

    // Handle Add a Plant button
    addPlantBtn.addEventListener("click", () => {
        alert("Adding a plant...");
    });
});
