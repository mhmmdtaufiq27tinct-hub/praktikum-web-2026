document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "todo_tasks";
  const MAX_TASKS = 5;
  const todoForm = document.querySelector("#todoForm");
  const taskInput = document.querySelector("#taskInput");
  const inputError01 = document.querySelector("#inputError01");
  const inputError02 = document.querySelector("#inputError02");
  const todoList = document.querySelector("#todoList");

  const getTasks = () => {
    try {
      const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(storedTasks)) return [];
      return storedTasks.filter((task) =>
        task && typeof task.text === "string" && typeof task.completed === "boolean"
      ).slice(0, MAX_TASKS);
    } catch {
      return [];
    }
  };

  const saveTasks = (tasks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  };

  const clearErrors = () => {
    taskInput.classList.remove("error");
    taskInput.removeAttribute("aria-invalid");
    inputError01.style.display = "none";
    inputError02.style.display = "none";
  };

  const showError = (errorElement) => {
    clearErrors();
    taskInput.classList.add("error");
    taskInput.setAttribute("aria-invalid", "true");
    errorElement.style.display = "block";
    taskInput.focus();
  };

  const renderTasks = () => {
    const tasks = getTasks();
    todoList.replaceChildren();

    if (tasks.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = "Belum ada tugas tersimpan.";
      todoList.appendChild(emptyMessage);
      return;
    }

    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = `todo-item${task.completed ? " completed" : ""}`;

      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = task.text;

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const completeButton = document.createElement("button");
      completeButton.type = "button";
      completeButton.className = "action-btn complete-btn";
      completeButton.dataset.index = index;
      completeButton.textContent = task.completed ? "Batal" : "Selesai";
      completeButton.setAttribute("aria-label", `${task.completed ? "Batalkan penyelesaian" : "Selesaikan"}: ${task.text}`);

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "action-btn delete-btn";
      deleteButton.dataset.index = index;
      deleteButton.textContent = "Hapus";
      deleteButton.setAttribute("aria-label", `Hapus: ${task.text}`);

      actions.append(completeButton, deleteButton);
      li.append(text, actions);
      todoList.appendChild(li);
    });
  };

  todoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const taskText = taskInput.value.trim();

    if (taskText.length < 3) {
      showError(inputError01);
      return;
    }

    const tasks = getTasks();
    if (tasks.length >= MAX_TASKS) {
      showError(inputError02);
      return;
    }

    clearErrors();
    tasks.push({ text: taskText, completed: false });
    saveTasks(tasks);
    taskInput.value = "";
    renderTasks();
    taskInput.focus();
  });

  taskInput.addEventListener("input", clearErrors);

  todoList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-index]");
    if (!button || !todoList.contains(button)) return;

    const index = Number(button.dataset.index);
    const tasks = getTasks();
    if (!Number.isInteger(index) || index < 0 || index >= tasks.length) return;

    if (button.classList.contains("complete-btn")) {
      tasks[index].completed = !tasks[index].completed;
    } else if (button.classList.contains("delete-btn")) {
      tasks.splice(index, 1);
    } else {
      return;
    }

    saveTasks(tasks);
    clearErrors();
    renderTasks();
  });

  renderTasks();
});
