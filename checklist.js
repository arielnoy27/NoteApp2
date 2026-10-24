function moveTask(from, to) {
  if (to < 0 || to >= activeNote.tasks.length) return;
  const [task] = activeNote.tasks.splice(from, 1);
  activeNote.tasks.splice(to, 0, task);
  const [done] = activeNote.done.splice(from, 1);
  activeNote.done.splice(to, 0, done);
  renderTasks(); save();
}

renderTasks = function() {
  activeNote.tasks ||= [];
  activeNote.done ||= [];
  const canvas = $('checklist-canvas');
  canvas.replaceChildren();

  activeNote.tasks.forEach((task, index) => {
    const row = document.createElement('div'); row.className = 'task-row'; row.draggable = true; row.dataset.index = index;
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = Boolean(activeNote.done[index]); check.setAttribute('aria-label', `Complete ${task || 'task'}`);
    const text = document.createElement('div'); text.className = `task-text${check.checked ? ' done' : ''}`; text.contentEditable = 'true'; text.spellcheck = true; text.textContent = task; text.dataset.placeholder = 'Task';
    const controls = document.createElement('div'); controls.className = 'task-controls';
    const up = document.createElement('button'); up.type = 'button'; up.textContent = '↑'; up.ariaLabel = 'Move task up'; up.disabled = index === 0;
    const down = document.createElement('button'); down.type = 'button'; down.textContent = '↓'; down.ariaLabel = 'Move task down'; down.disabled = index === activeNote.tasks.length - 1;
    controls.append(up, down); row.append(check, text, controls); canvas.append(row);

    check.onchange = () => { activeNote.done[index] = check.checked; text.classList.toggle('done', check.checked); save(); };
    text.oninput = () => { activeNote.tasks[index] = text.innerText.replace(/\n/g, ' '); activeNote.preview = activeNote.tasks.filter(Boolean).slice(0, 3).join(' · '); save(); };
    text.onkeydown = event => {
      if (event.key === 'Enter') { event.preventDefault(); activeNote.tasks.splice(index + 1, 0, ''); activeNote.done.splice(index + 1, 0, false); renderTasks(); canvas.querySelectorAll('.task-text')[index + 1]?.focus(); save(); }
      if (event.key === 'Backspace' && !text.innerText && activeNote.tasks.length > 1) { event.preventDefault(); activeNote.tasks.splice(index, 1); activeNote.done.splice(index, 1); renderTasks(); canvas.querySelectorAll('.task-text')[Math.max(0, index - 1)]?.focus(); save(); }
    };
    up.onclick = () => moveTask(index, index - 1); down.onclick = () => moveTask(index, index + 1);
    row.ondragstart = event => event.dataTransfer.setData('text/plain', String(index));
    row.ondragover = event => event.preventDefault();
    row.ondrop = event => { event.preventDefault(); moveTask(Number(event.dataTransfer.getData('text/plain')), index); };
  });

  const add = document.createElement('button'); add.className = 'add-task'; add.type = 'button'; add.textContent = '＋ Add a task';
  add.onclick = () => { activeNote.tasks.push(''); activeNote.done.push(false); renderTasks(); canvas.querySelectorAll('.task-text')[activeNote.tasks.length - 1]?.focus(); save(); };
  canvas.append(add);
};
