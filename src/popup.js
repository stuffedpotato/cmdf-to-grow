
console.log("Hello, world from popup!")

document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const newTaskInput = document.getElementById("new-task");
    const addTaskBtn = document.getElementById("add-task");
    const plantImg = document.getElementById("plant");

    // Load tasks from storage
    chrome.storage.sync.get("tasks", (data) => {
        if (data.tasks) {
            data.tasks.forEach(task => addTaskToUI(task.text, task.completed));
            updatePlantGrowth();
        }
    });

    // Add new task
    addTaskBtn.addEventListener("click", () => {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            addTaskToUI(taskText, false);
            saveTasks();
            newTaskInput.value = "";
            updatePlantGrowth();
        }
    });

    function addTaskToUI(text, completed) {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = completed;
        checkbox.addEventListener("change", saveTasks);
        li.appendChild(checkbox);
        li.appendChild(document.createTextNode(text));
        taskList.appendChild(li);
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll("#task-list li").forEach(li => {
            tasks.push({ text: li.textContent, completed: li.querySelector("input").checked });
        });
        chrome.storage.sync.set({ tasks }, updatePlantGrowth);
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
                plantImg.src = plantStages[growthStage];
                chrome.storage.sync.set({ plantStage: growthStage });
            }
        });
    }
});

