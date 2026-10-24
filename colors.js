const TEXT_COLORS = { blue:'#438ee8', green:'#35a875', yellow:'#e4b72f', red:'#e35d68', purple:'#9b6bd3' };
const ADAPTIVE_MARKER = '#010203';
const colorMenu = $('color-menu');
let savedRange = null;
document.addEventListener('selectionchange', () => { const selection=getSelection(); if(selection.rangeCount && $('writing-canvas').contains(selection.anchorNode)) savedRange=selection.getRangeAt(0).cloneRange(); });
function restoreEditorSelection(){ $('writing-canvas').focus(); if(!savedRange) return; const selection=getSelection(); selection.removeAllRanges(); selection.addRange(savedRange); }
$('color-button').onclick = () => colorMenu.classList.toggle('hidden');
function normalizeAdaptiveText(){ $('writing-canvas').querySelectorAll('font[color]').forEach(node=>{ const value=(node.getAttribute('color')||'').replace(/\s/g,'').toLowerCase(); if(value==='#010203'||value==='rgb(1,2,3)'){ node.removeAttribute('color'); node.style.color='var(--ink)'; node.dataset.adaptiveColor='true'; } }); }
colorMenu.querySelectorAll('[data-color]').forEach(button => button.onclick = () => { restoreEditorSelection(); document.execCommand('foreColor',false,button.dataset.color==='adaptive'?ADAPTIVE_MARKER:TEXT_COLORS[button.dataset.color]); normalizeAdaptiveText(); activeNote.bodyHtml=$('writing-canvas').innerHTML; activeNote.body=$('writing-canvas').innerText; colorMenu.classList.add('hidden'); save(); });
$('writing-canvas').addEventListener('input',()=>{ if(activeNote){ normalizeAdaptiveText(); activeNote.bodyHtml=$('writing-canvas').innerHTML; } });
document.addEventListener('click', event => { if (!colorMenu.contains(event.target) && !$('color-button').contains(event.target)) colorMenu.classList.add('hidden'); });
