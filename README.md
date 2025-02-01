# Task Manager

A simple and feature-rich task management web application built with vanilla JavaScript. This app allows users to create, manage, and prioritize tasks, organize them by categories, set deadlines, and track progress. It includes features like notifications, dark mode, task filtering, and even language support to improve usability.

## Features

- **Task Management**: Add, edit, delete tasks with priority, category, and deadline.
- **Subtasks**: Organize tasks hierarchically with subtasks that can be added, modified, or deleted.
- **Search & Filter**: Search tasks by name and filter them by category, completion status, or priority.
- **Sorting**: Sort tasks based on priority (High to Low or Low to High).
- **Pagination**: View tasks across multiple pages, with customizable page size.
- **Completion Toggle**: Mark tasks as complete or incomplete.
- **Notifications**: Receive notifications for tasks that are approaching their deadlines.
- **Dark Mode**: Toggle between light and dark modes, with preferences saved in `localStorage`.
- **Language Support**: Supports multiple languages (currently English and Spanish), with language preference saved in `localStorage`.
- **Dashboard**: View a pie chart summarizing tasks by category.

## Technologies Used

- **HTML**: Structure of the application
- **CSS**: Styling (Responsive design and theme toggle)
- **JavaScript**: Task management, event handling, data persistence, and UI logic
- **LocalStorage**: Saves tasks, theme, and language preferences locally

## Setup

Clone this repository to your local machine:

```bash
git clone https://github.com/HanumaAllu/Task-Manager.git
```

## Usage

### Task Management

- **Add Task**: Fill in the task name, category, deadline, and priority in the form and submit.
- **Edit Task**: Click the "Edit" button next to a task to modify it.
- **Delete Task**: Click the "Delete" button next to a task to remove it.
- **Add Subtask**: Add subtasks to any task using the "Add Subtask" button.

### Filters & Sorting

- **Search**: Use the search bar to filter tasks by name.
- **Category Filter**: Filter tasks by category from the dropdown.
- **Status Filter**: Filter tasks by their completion status (Completed or Incomplete).
- **Priority Sort**: Sort tasks by priority, either from high to low or vice versa.

## Notifications

The app will notify you if the task’s deadline is approaching. Please note that notifications only work when the app is open in the browser.

## Theme Toggle

Switch between light and dark modes using the theme toggle switch in the settings. The user's preference is saved in `localStorage`, so the selected theme persists even after the app is reloaded.

## Language Support

Select your preferred language (English or Hindi or Telugu) from the language dropdown in the settings. The language preference is saved in `localStorage`, ensuring that the selected language is maintained across sessions.

## Dashboard

Click the "Dashboard" button to view a pie chart summarizing the tasks by category. The chart provides a visual representation of how tasks are distributed across different categories, making it easier to track task progress and focus on key areas.

