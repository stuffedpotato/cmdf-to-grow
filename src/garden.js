document.addEventListener("DOMContentLoaded", () => {
    const plantsContainer = document.getElementById("plants-container");
    const logo = document.getElementById("home-btn");
    
    // Load tasks
    chrome.storage.sync.get("tasks", (data) => {
        if (data.tasks) {
            // Check if tasks is an object (and not an array)
            if (typeof data.tasks === 'object' && !Array.isArray(data.tasks)) {
                // Convert object to array
                const tasksArray = Object.values(data.tasks);
                tasksArray.forEach((task) => {
                    const plantStage = calculatePlantStage(task);
                    const plantCard = createPlantCard(task, plantStage);
                    plantsContainer.appendChild(plantCard);
                });
            } else if (Array.isArray(data.tasks)) {
                // If it's already an array, use it directly
                data.tasks.forEach((task) => {
                    const plantStage = calculatePlantStage(task);
                    const plantCard = createPlantCard(task, plantStage);
                    plantsContainer.appendChild(plantCard);
                });
            } else {
                console.error("Tasks data is neither an object nor an array:", data.tasks);
            }
        }
    });

    // The rest of your functions remain the same
    function calculatePlantStage(task) {
        const completedSubtasks = task.subtasks.filter(subTask => subTask.completed).length;
        const totalSubtasks = task.subtasks.length;
        const progress = completedSubtasks / totalSubtasks;
        if (progress === 0) return 0;
        if (progress <= 0.25) return 0;
        if (progress <= 0.5) return 1;
        if (progress <= 0.75) return 2;
        return 3; // 100% completed
    }

    function createPlantCard(task, plantStage) {
        const plantCard = document.createElement("div");
        plantCard.classList.add("plant-card");
        const plantImage = document.createElement("img");
        if (plantStage === 0) {
            plantImage.src = `img/sprout_0.png`;
        } else {
            plantImage.src = `img/plant${task.plant}-stage${plantStage}.png`;
            plantImage.alt = `Plant ${task.plant} Stage ${plantStage}`;
        }
        const taskName = document.createElement("p");
        taskName.textContent = task.main_task;
        plantCard.appendChild(plantImage);
        plantCard.appendChild(taskName);
        return plantCard;
    }

    // Back button to return to the main page
    logo.addEventListener("click", () => {
        window.location.href = "popup.html";
    });
});