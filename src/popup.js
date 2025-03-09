document.getElementById('generateButton').addEventListener('click', async () => {
    const prompt = document.getElementById('promptInput').value;
  
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
        body: JSON.stringify({ prompt }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        document.getElementById('response').textContent = data.error;
      } else {
        const subtasks = data.reply.join('\n');
        document.getElementById('response').textContent = subtasks;
  
        // Save the response to chrome.storage.sync
        chrome.storage.sync.set({ lastResponse: subtasks }, () => {
          console.log('Response saved to chrome.storage.sync');
        });
      }
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('response').textContent = 'Failed to generate subtasks.';
    }
  });
  
  // Load the last saved response when the popup opens
  chrome.storage.sync.get('lastResponse', (data) => {
    if (data.lastResponse) {
      document.getElementById('response').textContent = data.lastResponse;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const newTaskInput = document.getElementById("new-task");
    const addTaskBtn = document.getElementById("add-task");
    const addPlantBtn = document.getElementById("add-plant");

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

    // Add new task
    addTaskBtn.addEventListener("click", () => {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            const newTask = { main_task: taskText, subtasks: [], completed: false };
            tasks.push(newTask)
            addTaskToUI(taskText, false);
            saveTasks();
            newTaskInput.value = "";
        }
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
