const drawCanvas = $('drawing-canvas');
const drawTools = $('drawing-tools');
let drawContext = drawCanvas.getContext('2d');
let isDrawing = false;
let erasing = false;
let lastPoint = null;
let drawHistory = [];
let drawFuture = [];

function canvasSnapshot(){ return drawCanvas.width && drawCanvas.height ? drawCanvas.toDataURL('image/png') : ''; }
function restoreDrawing(source){
  drawContext.clearRect(0,0,drawCanvas.width,drawCanvas.height);
  if(!source) return;
  const image=new Image(); image.onload=()=>drawContext.drawImage(image,0,0,drawCanvas.width,drawCanvas.height); image.src=source;
}
function rememberDrawing(){ const shot=canvasSnapshot(); if(drawHistory.at(-1)!==shot) drawHistory.push(shot); if(drawHistory.length>20) drawHistory.shift(); drawFuture=[]; }
function saveDrawing(){ activeNote.drawing=canvasSnapshot(); activeNote.preview='Drawing'; save(); }

resizeCanvas = function(){
  const source=activeNote?.drawing || canvasSnapshot();
  const ratio=Math.min(devicePixelRatio||1,2); const rect=drawCanvas.getBoundingClientRect();
  drawCanvas.width=Math.max(1,Math.floor(rect.width*ratio)); drawCanvas.height=Math.max(1,Math.floor(rect.height*ratio));
  drawContext=drawCanvas.getContext('2d'); restoreDrawing(source);
};

function pointFromEvent(event){ const rect=drawCanvas.getBoundingClientRect(); return [(event.clientX-rect.left)*(drawCanvas.width/rect.width),(event.clientY-rect.top)*(drawCanvas.height/rect.height)]; }
function startStroke(event){ if(activeNote?.type!=='draw') return; event.preventDefault(); event.stopImmediatePropagation(); rememberDrawing(); isDrawing=true; lastPoint=pointFromEvent(event); drawCanvas.setPointerCapture?.(event.pointerId); }
function continueStroke(event){ if(!isDrawing) return; event.preventDefault(); event.stopImmediatePropagation(); const next=pointFromEvent(event); const ratio=Math.min(devicePixelRatio||1,2); drawContext.globalCompositeOperation=erasing?'destination-out':'source-over'; drawContext.strokeStyle=$('draw-color').value; drawContext.lineWidth=Number($('draw-size').value)*ratio; drawContext.lineCap='round'; drawContext.lineJoin='round'; drawContext.beginPath(); drawContext.moveTo(...lastPoint); drawContext.lineTo(...next); drawContext.stroke(); lastPoint=next; }
function endStroke(event){ if(!isDrawing) return; event.preventDefault(); event.stopImmediatePropagation(); isDrawing=false; drawContext.globalCompositeOperation='source-over'; saveDrawing(); }
drawCanvas.addEventListener('pointerdown',startStroke,true); drawCanvas.addEventListener('pointermove',continueStroke,true); drawCanvas.addEventListener('pointerup',endStroke,true); drawCanvas.addEventListener('pointercancel',endStroke,true);

$('draw-eraser').onclick=()=>{ erasing=!erasing; $('draw-eraser').classList.toggle('active',erasing); };
$('draw-undo').onclick=()=>{ if(!drawHistory.length)return; drawFuture.push(canvasSnapshot()); const shot=drawHistory.pop(); restoreDrawing(shot); activeNote.drawing=shot; save(); };
$('draw-redo').onclick=()=>{ if(!drawFuture.length)return; drawHistory.push(canvasSnapshot()); const shot=drawFuture.pop(); restoreDrawing(shot); activeNote.drawing=shot; save(); };
$('draw-clear').onclick=()=>{ rememberDrawing(); drawContext.clearRect(0,0,drawCanvas.width,drawCanvas.height); saveDrawing(); };
$('draw-exit').onclick=()=>closeEditor();

const setModeBeforeDrawing=setMode;
setMode=function(mode){ setModeBeforeDrawing(mode); const drawingMode=mode==='draw'; drawTools.classList.toggle('hidden',!drawingMode); $('format-bar').classList.toggle('hidden',drawingMode); if(drawingMode){ drawHistory=[]; drawFuture=[]; requestAnimationFrame(()=>{ resizeCanvas(); rememberDrawing(); }); } };
