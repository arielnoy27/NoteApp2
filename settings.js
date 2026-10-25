const SETTINGS_KEY='papertrail-settings';
const defaultSettings={name:'Alex',theme:localStorage.getItem('papertrail-theme')||'light',fontSize:'medium',lineSpacing:'comfortable'};
let appSettings={...defaultSettings,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')};
const settingsDialog=$('settings-dialog');

function resolvedTheme(theme){ return theme==='system' && matchMedia('(prefers-color-scheme: dark)').matches?'dark':theme==='system'?'light':theme; }
function applySettings(){
  const theme=resolvedTheme(appSettings.theme); document.documentElement.dataset.theme=theme; document.documentElement.dataset.fontSize=appSettings.fontSize; document.documentElement.dataset.lineSpacing=appSettings.lineSpacing;
  localStorage.setItem('papertrail-theme',theme); document.querySelector('meta[name="theme-color"]').content=theme==='dark'?'#071426':'#f2f6fb'; $('theme-toggle').textContent=theme==='dark'?'☀':'☾';
  const now=new Date(); $('today-label').textContent=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(now).toUpperCase();
  $('greeting-label').textContent=`Good ${now.getHours()<12?'morning':now.getHours()<18?'afternoon':'evening'},`; $('user-name-label').textContent=`${appSettings.name||'Alex'}.`;
}
function setActiveNav(target){ document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item===target)); }
$('nav-notes').onclick=()=>{ currentFilter='all'; document.querySelectorAll('.filter-chip').forEach(chip=>chip.classList.toggle('active',chip.dataset.filter==='all')); setActiveNav($('nav-notes')); renderNotes($('search-input').value); };
$('nav-tasks').onclick=()=>{ currentFilter='todo'; document.querySelectorAll('.filter-chip').forEach(chip=>chip.classList.toggle('active',chip.dataset.filter==='todo')); setActiveNav($('nav-tasks')); renderNotes($('search-input').value); };
$('nav-settings').onclick=()=>{ setActiveNav($('nav-settings')); $('setting-name').value=appSettings.name; $('setting-theme').value=appSettings.theme; $('setting-font-size').value=appSettings.fontSize; $('setting-line-spacing').value=appSettings.lineSpacing; settingsDialog.showModal(); };
document.querySelectorAll('.filter-chip').forEach(chip=>chip.addEventListener('click',()=>setActiveNav(chip.dataset.filter==='todo'?$('nav-tasks'):$('nav-notes'))));
$('new-note').addEventListener('click',()=>{ currentFilter='all'; document.querySelectorAll('.filter-chip').forEach(chip=>chip.classList.toggle('active',chip.dataset.filter==='all')); setActiveNav($('nav-notes')); });
$('settings-cancel').onclick=()=>{ settingsDialog.close(); setActiveNav(currentFilter==='todo'?$('nav-tasks'):$('nav-notes')); };
$('settings-form').onsubmit=event=>{ event.preventDefault(); appSettings={name:$('setting-name').value.trim()||'Alex',theme:$('setting-theme').value,fontSize:$('setting-font-size').value,lineSpacing:$('setting-line-spacing').value}; localStorage.setItem(SETTINGS_KEY,JSON.stringify(appSettings)); applySettings(); settingsDialog.close(); setActiveNav(currentFilter==='todo'?$('nav-tasks'):$('nav-notes')); };
$('theme-toggle').addEventListener('click',()=>{ appSettings.theme=document.documentElement.dataset.theme; localStorage.setItem(SETTINGS_KEY,JSON.stringify(appSettings)); });
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{ if(appSettings.theme==='system') applySettings(); });
applySettings();
