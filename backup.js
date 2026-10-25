const backupStatus=$('backup-status');
function safeFileName(value){ return (value||'untitled-note').trim().replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').replace(/\s+/g,' ').slice(0,80)||'untitled-note'; }
function downloadFile(name,content,type){ const blob=content instanceof Blob?content:new Blob([content],{type}); const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download=name; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }

$('export-backup').onclick=()=>{
  const backup={app:'Papertrail Notes',version:1,exportedAt:new Date().toISOString(),notes:structuredClone(notes),settings:structuredClone(appSettings)};
  downloadFile(`papertrail-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(backup,null,2),'application/json');
  backupStatus.textContent=`Exported ${notes.length} notes.`;
};
$('import-backup').onclick=()=>$('backup-file').click();
$('backup-file').onchange=async event=>{
  const file=event.target.files?.[0]; if(!file)return;
  try{
    const backup=JSON.parse(await file.text());
    if(!backup||!Array.isArray(backup.notes))throw new Error('Invalid backup');
    const valid=backup.notes.filter(note=>note&&['string','number'].includes(typeof note.id)&&typeof note.title==='string');
    const merged=new Map(notes.map(note=>[String(note.id),note])); valid.forEach(note=>merged.set(String(note.id),note)); notes.splice(0,notes.length,...merged.values());
    if(backup.settings&&typeof backup.settings==='object'){
      if(typeof backup.settings.name==='string')appSettings.name=backup.settings.name.slice(0,30)||'Alex';
      if(['light','dark','system'].includes(backup.settings.theme))appSettings.theme=backup.settings.theme;
      if(['small','medium','large'].includes(backup.settings.fontSize))appSettings.fontSize=backup.settings.fontSize;
      if(['compact','comfortable','roomy'].includes(backup.settings.lineSpacing))appSettings.lineSpacing=backup.settings.lineSpacing;
      localStorage.setItem(SETTINGS_KEY,JSON.stringify(appSettings)); applySettings();
    }
    await persistNotes(); renderNotes($('search-input').value); backupStatus.textContent=`Imported ${valid.length} notes. Your existing notes were kept.`;
  }catch{ backupStatus.textContent='That file is not a valid Papertrail backup.'; }
  event.target.value='';
};

const exportNoteButton=document.createElement('button'); exportNoteButton.type='button'; exportNoteButton.textContent='Export note'; $('more-menu').insertBefore(exportNoteButton,$('duplicate-button'));
exportNoteButton.onclick=()=>{
  const name=safeFileName(activeNote.title);
  if(activeNote.type==='draw'&&activeNote.drawing){ const link=document.createElement('a'); link.href=activeNote.drawing; link.download=`${name}.png`; document.body.append(link); link.click(); link.remove(); }
  else { const content=activeNote.type==='todo'?(activeNote.tasks||[]).map((task,index)=>`${activeNote.done?.[index]?'[x]':'[ ]'} ${task}`).join('\n'):(activeNote.body||''); downloadFile(`${name}.txt`,`${activeNote.title}\n\n${content}`,'text/plain;charset=utf-8'); }
  $('more-menu').classList.add('hidden');
};
