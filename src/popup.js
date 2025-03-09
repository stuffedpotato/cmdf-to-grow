document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const newTaskInput = document.getElementById("new-task");
    const addTaskBtn = document.getElementById("add-task");
    const plantImg = document.getElementById("plant");

    // Load tasks from storage
    chrome.storage.sync.get("tasks", (data) => {
        if (data.tasks) {
            data.tasks.forEach(task => addTaskToUI(task.text, task.completed, task.id));
            updatePlantGrowth();
        }
    });

    // Add new task
    addTaskBtn.addEventListener("click", () => {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            const taskId = Date.now(); // Unique task ID
            addTaskToUI(taskText, false, taskId);
            saveTasks();
            newTaskInput.value = "";
            updatePlantGrowth();
        }
    });

    function addTaskToUI(text, completed, taskId) {
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
            chrome.storage.sync.set({ currentTaskId: taskId }, () => {
                window.location.href = "subtasks.html";
            });
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(arrowBtn);
        taskList.appendChild(li);
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll("#task-list li").forEach(li => {
            tasks.push({
                text: li.children[1].textContent,
                completed: li.children[0].checked,
                id: Date.now() // ID for the task
            });
        });
        chrome.storage.sync.set({ tasks });
    }

    function updatePlantGrowth() {
        chrome.storage.sync.get("tasks", (data) => {
            if (data.tasks) {
                const completedTasks = data.tasks.filter(t => t.completed).length;
                const totalTasks = data.tasks.length;
                let growthStage = 0;

                if (totalTasks > 0) {
                    growthStage = Math.floor((completedTasks / totalTasks) * 3);
                }

                const plantStages = ["seed.png", "sprout.png", "bush.png", "tree.png"];
                // plantImg.src = plantStages[growthStage];
            }
        });
    }
});
