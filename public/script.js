document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const urgencyLevel = document.getElementById('urgency-level');
    const dueDate = document.getElementById('due-date');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
  
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks');
      const tasks = await response.json();
      taskList.innerHTML = '';
      tasks.forEach(task => addTaskToDOM(task));
    };
  
    const addTaskToDOM = (task) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.dataset.id = task.id;
  
      const span = document.createElement('span');
      span.innerHTML = `<strong>${task.text}</strong> <br> Urgência: ${task.urgency} <br> Prazo: ${task.dueDate || 'Sem prazo'}`;
      if (task.completed) {
        span.classList.add('completed');
      }
  
      const buttonsDiv = document.createElement('div');
  
      const completeBtn = document.createElement('button');
      completeBtn.className = 'btn btn-sm btn-success mr-2';
      completeBtn.textContent = 'Completar';
      completeBtn.onclick = () => toggleComplete(task.id);
  
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-danger';
      deleteBtn.textContent = 'Excluir';
      deleteBtn.onclick = () => deleteTask(task.id);
  
      buttonsDiv.appendChild(completeBtn);
      buttonsDiv.appendChild(deleteBtn);
      li.appendChild(span);
      li.appendChild(buttonsDiv);
  
      taskList.appendChild(li);
    };
  
    const addTask = async () => {
      const text = taskInput.value.trim();
      const urgency = urgencyLevel.value;
      const dueDateValue = dueDate.value;
      if (!text) return;
  
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: Date.now(), text, urgency, dueDate: dueDateValue, completed: false })
      });
  
      const newTask = await response.json();
      addTaskToDOM(newTask);
      taskInput.value = '';
      urgencyLevel.value = 'Baixa';
      dueDate.value = '';
    };
  
    const toggleComplete = async (id) => {
      const li = document.querySelector(`li[data-id='${id}']`);
      const span = li.querySelector('span');
      const completed = !span.classList.contains('completed');
  
      const text = span.querySelector('strong').textContent;
      const urgency = span.innerHTML.split('Urgência: ')[1].split('<br>')[0];
      const dueDate = span.innerHTML.split('Prazo: ')[1] === 'Sem prazo' ? null : span.innerHTML.split('Prazo: ')[1];
  
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, text, urgency, dueDate, completed })
      });
  
      const updatedTask = await response.json();
      span.classList.toggle('completed', updatedTask.completed);
    };
  
    const deleteTask = async (id) => {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      document.querySelector(`li[data-id='${id}']`).remove();
    };
  
    addTaskBtn.onclick = addTask;
    fetchTasks();
  });
  