// Task Manager Application
// Selectors
const taskForm = document.getElementById("task-form");
const taskNameInput = document.getElementById("task-name");
const taskCategoryInput = document.getElementById("task-category");
const taskDeadlineInput = document.getElementById("task-deadline");
// Modification: Added priority input selector
const taskPriorityInput = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");
const searchBar = document.getElementById("search-bar");
const filterCategory = document.getElementById("filter-category");
// Modification: Added filter status selector
const filterStatus = document.getElementById("filter-status");
// Modification: Added sort priority selector
const sortPriority = document.getElementById("sort-priority");
// Modification: Added theme toggle selector
const themeToggle = document.getElementById("theme-toggle");
// Modification: Added language selector
const languageSelect = document.getElementById("language-select");
// Modification: Added dashboard elements
const dashboardBtn = document.getElementById("dashboard-btn");
const dashboardModal = document.getElementById("dashboard-modal");
const closeModal = dashboardModal.querySelector(".close");
// Modification: Added pagination controls selector
const paginationControls = document.getElementById("pagination-controls");

// Task array
let tasks = [];

// Global variables for pagination
let currentTaskArray = [];
let currentPage = 1;
const pageSize = 5; // You can adjust the number of tasks per page

// Load tasks from localStorage
document.addEventListener("DOMContentLoaded", () => {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  displayTasks(tasks);
  // Modification: Load theme preference
  const theme = localStorage.getItem("theme") || "light";
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.checked = true;
  }
  // Modification: Load language preference
  const language = localStorage.getItem("language") || "en";
  languageSelect.value = language;
  applyTranslations(language);
});

// Add Event Listener for the Accordion Toggle (Subtasks)
document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("accordion-toggle")) {
    const content = e.target.nextElementSibling;
    content.style.display =
      content.style.display === "block" ? "none" : "block";
  }
});

// Event Listeners
taskForm.addEventListener("submit", addTask);
taskList.addEventListener("click", modifyTask);
taskList.addEventListener("change", toggleTaskCompletion); // Modification: Added event listener for task completion
searchBar.addEventListener("input", searchTasks);
filterCategory.addEventListener("change", filterTasks);
filterStatus.addEventListener("change", filterTasks); // Modification: Added filter status event listener
sortPriority.addEventListener("change", sortTasksByPriority); // Modification: Added sort priority event listener
themeToggle.addEventListener("change", toggleTheme); // Modification: Added theme toggle event listener
languageSelect.addEventListener("change", () => {
  const selectedLanguage = languageSelect.value;
  localStorage.setItem("language", selectedLanguage);
  applyTranslations(selectedLanguage);
});
// Modification: Added language selector event listener
dashboardBtn.addEventListener("click", openDashboard); // Modification: Added dashboard button event listener
closeModal.addEventListener("click", () => {
  dashboardModal.style.display = "none";
});
// Modification: Added close modal event listener
// Modification: Request notification permission
if ("Notification" in window) {
  if (
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    });
  }
}
// Functions
function addTask(e) {
  e.preventDefault();
  const task = {
    id: Date.now(),
    name: taskNameInput.value,
    category: taskCategoryInput.value,
    deadline: taskDeadlineInput.value,
    priority: taskPriorityInput.value, // Modification: Added priority property
    completed: false, // Modification: Added completed property
    subtasks: [], // Modification: Added subtasks property
  };
  tasks.push(task);
  saveTasks();
  displayTasks(tasks);
  taskForm.reset();
  // Modification: Schedule notification (Note: Only works if the app is open)
  if (task.deadline) {
    scheduleNotification(task);
  }
}

// Modification: Added renderPaginationControls function
function renderPaginationControls(totalTasks, currentPage, pageSize) {
  paginationControls.innerHTML = ""; // Clear existing controls

  const totalPages = Math.ceil(totalTasks / pageSize);

  // If only one page, don't show pagination controls
  if (totalPages <= 1) {
    return;
  }

  // Create Previous button
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    displayTasks(currentTaskArray, currentPage - 1, pageSize);
  });
  paginationControls.appendChild(prevButton);

  // Create page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageNumberBtn = document.createElement("button");
    pageNumberBtn.textContent = i;
    if (i === currentPage) {
      pageNumberBtn.disabled = true;
    }
    pageNumberBtn.addEventListener("click", () => {
      displayTasks(currentTaskArray, i, pageSize);
    });
    paginationControls.appendChild(pageNumberBtn);
  }

  // Create Next button
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    displayTasks(currentTaskArray, currentPage + 1, pageSize);
  });
  paginationControls.appendChild(nextButton);
}

function displayTasks(taskArray, pageNumber = currentPage || 1, pageSize = 5) {
  taskList.innerHTML = ""; // Clear the current task list

  currentTaskArray = taskArray; // Save the current task array
  currentPage = pageNumber; // Save the current page number

  if (taskArray.length === 0) {
    taskList.innerHTML = "<p>No tasks to display.</p>";
    paginationControls.innerHTML = "";
    return;
  }

  // Calculate the start and end indices for slicing the taskArray
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedTasks = taskArray.slice(startIndex, endIndex);

  // Loop through the paginated tasks
  paginatedTasks.forEach((task) => {
    const li = renderTask(task); // Render each task
    taskList.appendChild(li); // Add the task to the DOM
  });

  // Now, we need to render the pagination controls
  renderPaginationControls(taskArray.length, currentPage, pageSize);
}

function updateDisplayedTasks() {
  let updatedTasks = tasks.slice(); // Copy the tasks array

  // Apply search filter
  const keyword = searchBar.value.toLowerCase();
  if (keyword) {
    updatedTasks = updatedTasks.filter((task) =>
      task.name.toLowerCase().includes(keyword)
    );
  }

  // Apply category filter
  const category = filterCategory.value;
  if (category !== "All") {
    updatedTasks = updatedTasks.filter((task) => task.category === category);
  }

  // Apply status filter
  const status = filterStatus.value;
  if (status === "Completed") {
    updatedTasks = updatedTasks.filter((task) => task.completed);
  } else if (status === "Incomplete") {
    updatedTasks = updatedTasks.filter((task) => !task.completed);
  }

  // Apply sorting
  const sortOrder = sortPriority.value; // Get the selected sort order (High to Low or Low to High)
  if (sortOrder === "High") {
    // Sort from High to Low (ascending order since High priority has lower value)
    updatedTasks.sort(
      (a, b) => getPriorityLevel(a.priority) - getPriorityLevel(b.priority)
    );
  } else if (sortOrder === "Low") {
    // Sort from Low to High (descending order since Low priority has higher value)
    updatedTasks.sort(
      (a, b) => getPriorityLevel(b.priority) - getPriorityLevel(a.priority)
    );
  }

  // Reset current page to 1
  currentPage = 1;

  // Display the updated tasks
  displayTasks(updatedTasks, currentPage);
}

//Language
let currentLanguage = localStorage.getItem("language") || "en"; // Default to English

languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem("language", currentLanguage);
  applyTranslations(currentLanguage); // Update UI text
  updateDisplayedTasks(); // Re-render tasks with new language
});

// Helper function to render subtasks
function renderSubtask(subtask) {
  return `
        <li class="task-item subtask" data-id="${subtask.id}">
            <input type="checkbox" class="complete-task" ${
              subtask.completed ? "checked" : ""
            }>
            <h3 ${subtask.completed ? 'class="completed"' : ""}>${
    subtask.name
  }</h3>
            <p>${translations[currentLanguage].category}: ${
    translations[currentLanguage][subtask.category.toLowerCase()] ||
    subtask.category
  }</p>
            <p>${translations[currentLanguage].deadline}: ${
    subtask.deadline || translations[currentLanguage].noDeadline
  }</p>
            <p>${translations[currentLanguage].priority}: ${
    translations[currentLanguage][subtask.priority.toLowerCase()] ||
    subtask.priority
  }</p>
        </li>
    `;
}

// Modification: Added renderTask function to handle subtasks recursively
function renderTask(task) {
  const li = document.createElement("li");
  li.classList.add("task-item", task.priority.toLowerCase() + "-priority");
  li.setAttribute("data-id", task.id); // Set the task ID as a data attribute

  // Use translations for displaying task details
  const categoryLabel = `${translations[currentLanguage].category}: `;
  const deadlineLabel = `${translations[currentLanguage].deadline}: `;
  const priorityLabel = `${translations[currentLanguage].priority}: `;

  // Handle deadline display
  const deadlineDisplay =
    task.deadline || translations[currentLanguage].noDeadline;

  li.innerHTML = `
        <input type="checkbox" class="complete-task" ${
          task.completed ? "checked" : ""
        }>
        <h3 ${task.completed ? 'class="completed"' : ""}>${task.name}</h3>
        <p>${categoryLabel}${
    translations[currentLanguage][task.category.toLowerCase()] || task.category
  }</p>
        <p>${deadlineLabel}${deadlineDisplay}</p>
        <p>${priorityLabel}${
    translations[currentLanguage][task.priority.toLowerCase()] || task.priority
  }</p>
        <div class="task-actions">
            <button class="add-subtask-btn" data-id="${task.id}">${
    translations[currentLanguage].addSubtask
  }</button>
            <button class="edit-btn">${
              translations[currentLanguage].edit
            }</button>
            <button class="delete-btn">${
              translations[currentLanguage].delete
            }</button>
        </div>
    `;

  // Check if the task has subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    const accordion = document.createElement("div");
    accordion.classList.add("subtask-accordion");
    accordion.innerHTML = `
            <button class="accordion-toggle">View Subtasks</button>
            <div class="accordion-content">
                <ul>${task.subtasks
                  .map((subtask) => renderSubtask(subtask))
                  .join("")}</ul>
            </div>
        `;
    li.appendChild(accordion);
  }

  return li;
}

function modifyTask(e) {
  const taskItem = e.target.closest(".task-item");
  const taskId = taskItem.dataset.id;

  if (e.target.classList.contains("delete-btn")) {
    deleteTask(taskId);
  } else if (e.target.classList.contains("edit-btn")) {
    editTask(taskId);
  }
  // Handle Add Subtask button click
  else if (e.target.classList.contains("add-subtask-btn")) {
    addSubtask(taskId);
  }
}

function deleteTask(id) {
  tasks = removeTaskById(tasks, id);
  saveTasks();
  displayTasks(tasks);
}

// Modification: Added removeTaskById function to remove tasks recursively
function removeTaskById(taskArray, id) {
  return taskArray.filter((task) => {
    if (task.id == id) {
      return false;
    } else if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks = removeTaskById(task.subtasks, id);
    }
    return true;
  });
}

function editTask(id) {
  const task = findTaskById(tasks, id);
  if (task) {
    taskNameInput.value = task.name;
    taskCategoryInput.value = task.category;
    taskDeadlineInput.value = task.deadline;
    taskPriorityInput.value = task.priority; // Modification: Pre-fill priority
    deleteTask(id);
  }
}

// Modification: Added findTaskById function to find tasks recursively
function findTaskById(taskArray, id) {
  for (let task of taskArray) {
    if (task.id == id) {
      return task;
    } else if (task.subtasks && task.subtasks.length > 0) {
      const found = findTaskById(task.subtasks, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

// Modification: Added addSubtask function
function addSubtask(parentTaskId) {
  const subtaskName = prompt("Enter subtask name:");
  if (subtaskName) {
    // Find the parent task by its ID
    const parentTask = findTaskById(tasks, parentTaskId);

    if (parentTask) {
      // Create the subtask object
      const subtask = {
        id: Date.now(),
        name: subtaskName,
        category: parentTask.category, // Inherit category from parent task
        deadline: parentTask.deadline, // Inherit deadline from parent task
        priority: parentTask.priority, // Inherit priority from parent task
        completed: false,
        subtasks: [], // No subtasks allowed in subtasks
      };

      // Add the subtask to the parent task's subtasks array
      parentTask.subtasks.push(subtask);

      // Save the updated tasks array to localStorage
      saveTasks();

      // Re-render the task list to display the new subtask
      updateDisplayedTasks();
    }
  }
}

function searchTasks() {
  const keyword = searchBar.value.toLowerCase();
  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(keyword)
  );
  displayTasks(filteredTasks);
}
function filterTasks() {
  const category = filterCategory.value;
  const status = filterStatus.value;
  let filteredTasks = tasks;
  if (category !== "All") {
    filteredTasks = filteredTasks.filter((task) => task.category === category);
  }
  if (status === "Completed") {
    filteredTasks = filteredTasks.filter((task) => task.completed);
  } else if (status === "Incomplete") {
    filteredTasks = filteredTasks.filter((task) => !task.completed);
  }
  displayTasks(filteredTasks);
}
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Modification: Added toggleTaskCompletion function
function toggleTaskCompletion(e) {
  if (e.target.classList.contains("complete-task")) {
    const taskItem = e.target.closest(".task-item");
    const taskId = taskItem.dataset.id; // Get the task or subtask ID

    // Find the task or subtask by its ID
    const task = findTaskById(tasks, taskId);
    if (task) {
      // Toggle the completed status
      task.completed = e.target.checked;

      // Save the updated tasks to localStorage
      saveTasks();

      // Re-render the tasks list
      updateDisplayedTasks();
    }
  }
}

// Modification: Added getPriorityLevel function
function getPriorityLevel(priority) {
  switch (priority) {
    case "High":
      return 1; // Highest priority
    case "Medium":
      return 2; // Medium priority
    case "Low":
      return 3; // Lowest priority
    default:
      return 4; // For tasks with no priority or invalid priority
  }
}

// Modification: Added sortTasksByPriority function
function sortTasksByPriority() {
  const sortOrder = sortPriority.value; // Get the selected sort order (High to Low or Low to High)
  let sortedTasks = [...tasks]; // Create a copy of the tasks array to sort

  if (sortOrder === "High") {
    // Sort from High to Low (descending order)
    sortedTasks.sort(
      (a, b) => getPriorityLevel(a.priority) - getPriorityLevel(b.priority)
    );
  } else if (sortOrder === "Low") {
    // Sort from Low to High (ascending order)
    sortedTasks.sort(
      (a, b) => getPriorityLevel(b.priority) - getPriorityLevel(a.priority)
    );
  }

  displayTasks(sortedTasks); // Re-render the tasks with the sorted order
}

// Modification: Added toggleTheme function
function toggleTheme() {
  if (themeToggle.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
}

// Modification: Added language support
const translations = {
  en: {
    addNewTask: "Add New Task",
    taskName: "Task Name",
    category: "Category",
    work: "Work",
    personal: "Personal",
    urgent: "Urgent",
    deadline: "Deadline",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    addTask: "Add Task",
    taskList: "Task List",
    searchTasks: "Search tasks...",
    allCategories: "All Categories",
    allTasks: "All Tasks",
    completed: "Completed",
    incomplete: "Incomplete",
    highToLow: "High to Low",
    lowToHigh: "Low to High",
    noDeadline: "No Deadline",
    addSubtask: "Add Subtask",
    edit: "Edit",
    delete: "Delete",
    // ... other translations
  },
  hi: {
    addNewTask: "नया कार्य जोड़ें",
    taskName: "कार्य का नाम",
    category: "श्रेणी",
    work: "कार्य",
    personal: "व्यक्तिगत",
    urgent: "तत्काल",
    deadline: "अंतिम तिथि",
    priority: "प्राथमिकता",
    high: "उच्च",
    medium: "मध्यम",
    low: "निम्न",
    addTask: "कार्य जोड़ें",
    taskList: "कार्य सूची",
    searchTasks: "कार्य खोजें...",
    allCategories: "सभी श्रेणियाँ",
    allTasks: "सभी कार्य",
    completed: "पूर्ण",
    incomplete: "अपूर्ण",
    highToLow: "उच्च से निम्न",
    lowToHigh: "निम्न से उच्च",
    noDeadline: "कोई समय सीमा नहीं",
    addSubtask: "उपकार्य जोड़ें",
    edit: "संपादित करें",
    delete: "हटाएँ",
    // ... other translations
  },
  te: {
    addNewTask: "కొత్త పని జోడించండి",
    taskName: "పనికి పేరు",
    category: "వర్గం",
    work: "పని",
    personal: "వ్యక్తిగత",
    urgent: "తక్షణం",
    deadline: "గడువు",
    priority: "ప్రాధాన్యం",
    high: "అత్యున్నత",
    medium: "మధ్యస్థ",
    low: "తక్కువ",
    addTask: "పని జోడించండి",
    taskList: "పనుల జాబితా",
    searchTasks: "పనులను శోధించండి...",
    allCategories: "అన్ని వర్గాలు",
    allTasks: "అన్ని పనులు",
    completed: "పూర్తయింది",
    incomplete: "పూర్తి కాలేదు",
    highToLow: "అత్యున్నత నుండి తక్కువకు",
    lowToHigh: "తక్కువ నుండి అత్యున్నతకు",
    noDeadline: "ఏ సమయ పరిమితి లేదు",
    addSubtask: "ఉపకార్యాన్ని జోడించండి",
    edit: "సవరించు",
    delete: "తొలగించు",
    // ... other translations
  },
};
function applyTranslations(language) {
  document.querySelector("#task-form-section h2").textContent =
    translations[language].addNewTask;
  document.querySelector('label[for="task-name"]').textContent =
    translations[language].taskName + ":";
  document.querySelector('label[for="task-category"]').textContent =
    translations[language].category + ":";
  document.querySelector('#task-category option[value="Work"]').textContent =
    translations[language].work;
  document.querySelector(
    '#task-category option[value="Personal"]'
  ).textContent = translations[language].personal;
  document.querySelector('#task-category option[value="Urgent"]').textContent =
    translations[language].urgent;
  document.querySelector('label[for="task-deadline"]').textContent =
    translations[language].deadline + ":";
  document.querySelector('label[for="task-priority"]').textContent =
    translations[language].priority + ":";
  document.querySelector('#task-priority option[value="High"]').textContent =
    translations[language].high;
  document.querySelector('#task-priority option[value="Medium"]').textContent =
    translations[language].medium;
  document.querySelector('#task-priority option[value="Low"]').textContent =
    translations[language].low;
  document.querySelector('#task-form button[type="submit"]').textContent =
    translations[language].addTask;
  document.querySelector("#task-list-section h2").textContent =
    translations[language].taskList;
  document.querySelector("#search-bar").placeholder =
    translations[language].searchTasks;
  document.querySelector('#filter-category option[value="All"]').textContent =
    translations[language].allCategories;
  document.querySelector('#filter-status option[value="All"]').textContent =
    translations[language].allTasks;
  document.querySelector(
    '#filter-status option[value="Completed"]'
  ).textContent = translations[language].completed;
  document.querySelector(
    '#filter-status option[value="Incomplete"]'
  ).textContent = translations[language].incomplete;
  document.querySelector('#sort-priority option[value="High"]').textContent =
    translations[language].highToLow;
  document.querySelector('#sort-priority option[value="Low"]').textContent =
    translations[language].lowToHigh;
  // Update other text elements as needed
}

// Modification: Added dashboard functionality
function openDashboard() {
  dashboardModal.style.display = "block";
  generateChart();
}
function generateChart() {
  const categories = {};
  tasks.forEach((task) => {
    categories[task.category] = (categories[task.category] || 0) + 1;
  });
  const ctx = document.getElementById("tasks-chart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: ["red", "blue", "green", "yellow", "orange"],
        },
      ],
    },
  });
}

// Modification: Added scheduleNotification function (Note: Works only if the app is open)
function scheduleNotification(task) {
  const deadline = new Date(task.deadline).getTime();
  const now = Date.now();
  const timeUntilDeadline = deadline - now;
  if (timeUntilDeadline > 0) {
    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("Task Reminder", {
          body: `Deadline for task "${task.name}" is today.`,
        });
      }
    }, timeUntilDeadline);
  }
}
