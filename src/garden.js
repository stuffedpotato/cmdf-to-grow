document.addEventListener("DOMContentLoaded", () => {
    const plantsContainer = document.getElementById("plants-container");
    const logo = document.getElementById("home-btn");

    // Load tasks 
    chrome.storage.sync.get("tasks", (data) => {
        if (data.tasks) {
            data.tasks.forEach((task) => {
                const plantStage = calculatePlantStage(task);
                const plantCard = createPlantCard(task, plantStage);
                plantsContainer.appendChild(plantCard);
            });
        }
    });

    // Calculate the plant stage based on sub-task progress
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

    // Create a plant card for a task
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
