const moreMenu = $('more-menu');
const historyControls = document.createElement('div'); historyControls.className = 'history-controls';
const undoButton = document.createElement('button'); undoButton.type = 'button'; undoButton.textContent = '↶ Undo'; undoButton.ariaLabel = 'Undo last edit';
const redoButton = document.createElement('button'); redoButton.type = 'button'; redoButton.textContent = '↷ Redo'; redoButton.ariaLabel = 'Redo last edit';
historyControls.append(undoButton, redoButton);
const noteStats = document.createElement('div'); noteStats.className = 'note-stats'; noteStats.setAttribute('aria-live', 'polite');
moreMenu.prepend(historyControls); moreMenu.append(noteStats);

function updateEditorStats() {
  if (!activeNote) return;
  let text = '';
  if (activeNote.type === 'todo') text = (activeNote.tasks || []).join(' ');
  else if (activeNote.type === 'plain') text = $('writing-canvas').innerText;
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  noteStats.textContent = `${words} ${words === 1 ? 'word' : 'words'} · ${text.length} characters`;
  const isWriting = activeNote.type === 'plain'; undoButton.disabled = !isWriting; redoButton.disabled = !isWriting;
}

function runHistoryCommand(command) {
  if (activeNote?.type !== 'plain') return;
  $('writing-canvas').focus(); document.execCommand(command);
  activeNote.body = $('writing-canvas').innerText; activeNote.bodyHtml = $('writing-canvas').innerHTML; activeNote.preview = activeNote.body.slice(0, 120);
  updateEditorStats(); save();
}

undoButton.onclick = () => runHistoryCommand('undo'); redoButton.onclick = () => runHistoryCommand('redo');
$('writing-canvas').addEventListener('input', updateEditorStats);
$('checklist-canvas').addEventListener('input', updateEditorStats);
$('more-button').addEventListener('click', updateEditorStats);
document.addEventListener('keydown', event => {
  if (!$('editor-view').classList.contains('hidden') && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault(); runHistoryCommand(event.shiftKey ? 'redo' : 'undo');
  }
});
const openNoteBeforeTools = openNote;
openNote = function(id) { openNoteBeforeTools(id); updateEditorStats(); };
