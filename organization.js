// Organization stays in note records so it travels with offline storage.
let selectedFolder = '';
const folderSelect = document.getElementById('folder-filter');
const organizeDialog = document.getElementById('organize-dialog');
const organizeButton = document.createElement('button');
organizeButton.textContent = 'Folder and tags';
document.getElementById('more-menu').prepend(organizeButton);

renderNotes = function(query = '') {
  const folders = [...new Set(notes.map(n => n.folder).filter(Boolean))].sort();
  folderSelect.replaceChildren(new Option('All folders', ''), new Option('Unfiled', '__unfiled'), ...folders.map(f => new Option(f, f)));
  folderSelect.value = selectedFolder;
  const visible = notes.filter(n => {
    if (currentFilter === 'trash' ? !n.deleted : n.deleted) return false;
    if (currentFilter === 'archived' ? !n.archived : currentFilter !== 'trash' && n.archived) return false;
    if (currentFilter === 'pinned' && !n.pinned || currentFilter === 'todo' && n.type !== 'todo') return false;
    if (selectedFolder === '__unfiled' ? n.folder : selectedFolder && n.folder !== selectedFolder) return false;
    return [n.title, n.body, n.preview, ...(n.tasks || []), n.folder, ...(n.tags || [])].join(' ').toLowerCase().includes(query.toLowerCase());
  }).sort((a,b) => Number(!!b.pinned) - Number(!!a.pinned));
  $('note-count').textContent = `${visible.length} ${visible.length === 1 ? 'note' : 'notes'}`;
  const list = $('notes-list');
  list.replaceChildren();
  for (const note of visible) {
    const card = document.createElement('button'); card.className = 'note-card';
    const title = document.createElement('h3'); title.textContent = `${note.pinned ? 'Pinned · ' : ''}${note.title || 'Untitled note'}`;
    const preview = document.createElement('p'); preview.textContent = note.preview || 'Empty note';
    const meta = document.createElement('div'); meta.className = 'note-meta'; meta.textContent = [note.folder || 'Unfiled', ...(note.tags || []).map(t => '#' + t)].join(' · ');
    card.append(title, preview, meta); card.onclick = () => { $('more-menu').classList.add('hidden'); openNote(note.id); }; list.append(card);
  }
  if (!visible.length) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = 'No notes here. Try another folder or search.'; list.append(empty); }
};
folderSelect.onchange = () => { selectedFolder = folderSelect.value; renderNotes($('search-input').value); };
organizeButton.onclick = () => {
  $('more-menu').classList.add('hidden');
  $('note-folder').value = activeNote.folder || ''; $('note-tags').value = (activeNote.tags || []).join(', ');
  $('folder-options').replaceChildren(...[...new Set(notes.map(n => n.folder).filter(Boolean))].map(f => new Option(f, f)));
  organizeDialog.showModal();
};
$('organize-cancel').onclick = () => organizeDialog.close();
$('organize-form').onsubmit = async event => {
  event.preventDefault(); activeNote.folder = $('note-folder').value.trim();
  activeNote.tags = [...new Set($('note-tags').value.split(',').map(t => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean))].slice(0, 20);
  try { await persistNotes(); $('save-status').textContent = 'Saved locally'; organizeDialog.close(); }
  catch { $('save-status').textContent = 'Could not save. Please try again.'; }
};
renderNotes();
