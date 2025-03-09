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

    // Load tasks from storage
    chrome.storage.sync.get("tasks", (data) => {
        if (data.tasks) {
            data.tasks.forEach(task => addTaskToUI(task.text, task.completed));
        }
    });

    // Add new task
    addTaskBtn.addEventListener("click", () => {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            addTaskToUI(taskText, false);
            saveTasks();
            newTaskInput.value = "";
        }
    });

    function addTaskToUI(text, completed) {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = completed;
        checkbox.addEventListener("change", saveTasks);

        const taskText = document.createElement("span");
        taskText.textContent = text;

        const arrowBtn = document.createElement("button");
        arrowBtn.textContent = "→";
        arrowBtn.classList.add("arrow-btn");
        arrowBtn.addEventListener("click", () => {
            window.location.href = "subtasks.html";
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => {
            li.remove(); // Remove from UI
            saveTasks(); // Save updated task list
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(arrowBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll("#task-list li").forEach(li => {
            tasks.push({ text: li.children[1].textContent, completed: li.children[0].checked });
        });

        tasks.forEach(task => {
            if (task.subtasks) {
                task.completed = task.subtasks.every(subtask => subtask.completed);
            }
        });
        
        chrome.storage.sync.set({ tasks });
    }

    // Handle Add a Plant button
    addPlantBtn.addEventListener("click", () => {
        alert("Adding a plant...");
    });
});
