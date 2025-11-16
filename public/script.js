const API_URL = '/api/tasks';
const taskList = document.getElementById('taskList');
const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');

// Load all tasks from the backend
async function loadTasks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Failed to load tasks (${res.status})`);

    const tasks = await res.json();
    taskList.innerHTML = '';

    tasks.forEach(task => {
      const li = document.createElement('li');

      // Task title
      const span = document.createElement('span');
      span.textContent = task.title;
      span.style.textDecoration = task.completed ? 'line-through' : 'none';

      // Done/Undo button
      const btnDone = document.createElement('button');
      btnDone.textContent = task.completed ? 'Undo' : 'Done';
      btnDone.className = 'btn-done';
      btnDone.addEventListener('click', () => toggleTask(task.id, !task.completed));

      // Delete button
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Delete';
      btnDelete.className = 'btn-delete';
      btnDelete.addEventListener('click', () => deleteTask(task.id));

      // Reminder button
      const btnReminder = document.createElement('button');
      btnReminder.textContent = 'Set Reminder';
      btnReminder.className = 'btn-reminder';
      btnReminder.addEventListener('click', () => setReminder(task));

      // Combine buttons
      const btnContainer = document.createElement('div');
      btnContainer.append(btnDone, btnDelete, btnReminder);

      li.append(span, btnContainer);
      taskList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert('❌ Failed to load tasks. Please check the server or reload.');
  }
}

// Add a new task
addBtn.addEventListener('click', async () => {
  const title = taskInput.value.trim();
  if (!title) return alert('Please enter a task.');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to add task');
    taskInput.value = '';
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert('❌ Could not add task.');
  }
})

// Toggle complete / undo
async function toggleTask(id, completed) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error('Failed to update task');
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert('❌ Could not update task status.');
  }
}

// Delete task
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
    await loadTasks();
  } catch (err) {
    console.error(err);
    alert('❌ Could not delete task.');
  }
}

// ✅ Reminder Function
function setReminder(task) {
  const input = document.createElement('input');
  input.type = 'datetime-local';
  input.style.position = 'fixed';
  input.style.top = '50%';
  input.style.left = '50%';
  input.style.transform = 'translate(-50%, -50%)';
  input.style.zIndex = 9999;
  input.style.background = '#fff';
  input.style.padding = '10px';
  input.style.border = '2px solid #007bff';
  input.style.borderRadius = '8px';
  document.body.appendChild(input);

  input.addEventListener('change', () => {
    const reminderDate = new Date(input.value);
    if (isNaN(reminderDate.getTime())) {
      alert('❌ Invalid time.');
      document.body.removeChild(input);
      return;
    }

    const now = new Date();
    const timeDiff = reminderDate - now;
    if (timeDiff <= 0) {
      alert('⚠️ Time must be in the future.');
      document.body.removeChild(input);
      return;
    }

    alert(`✅ Reminder set for "${task.title}" at ${reminderDate.toLocaleString()}`);
    document.body.removeChild(input);

    setTimeout(() => {
      alert(`🔔 Reminder: ${task.title}`);
      // Optional: play alarm sound
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
      audio.play();
    }, timeDiff);
  });

  input.focus();
}

// Initial load
loadTasks();
