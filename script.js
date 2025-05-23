const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');

const downloadModal = document.getElementById('downloadModal');
const filenameInput = document.getElementById('filenameInput');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

let drawing = false;
let currentPath = [];

let undoStack = [];
let redoStack = [];

// Resize canvas to fit container
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  redraw();
}

// Start drawing
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  currentPath = [];
  ctx.beginPath();
  const pos = getMousePos(e);
  ctx.moveTo(pos.x, pos.y);
  currentPath.push(pos);
});

// Drawing move
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const pos = getMousePos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  currentPath.push(pos);
});

// Stop drawing and save state
canvas.addEventListener('mouseup', () => {
  if (!drawing) return;
  drawing = false;
  undoStack.push({
    color: colorPicker.value,
    size: brushSize.value,
    path: currentPath.slice(),
  });
  redoStack = []; // Clear redo on new action
});

// Stop drawing if mouse leaves canvas
canvas.addEventListener('mouseleave', () => {
  if (drawing) {
    drawing = false;
    undoStack.push({
      color: colorPicker.value,
      size: brushSize.value,
      path: currentPath.slice(),
    });
    redoStack = [];
  }
});

function getMousePos(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

// Redraw all paths from undoStack
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const action of undoStack) {
    ctx.beginPath();
    ctx.strokeStyle = action.color;
    ctx.lineWidth = action.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const path = action.path;
    if (path.length > 0) {
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
  }
}

// Undo functionality
undoBtn.addEventListener('click', () => {
  if (undoStack.length === 0) return;
  const action = undoStack.pop();
  redoStack.push(action);
  redraw();
});

// Redo functionality
redoBtn.addEventListener('click', () => {
  if (redoStack.length === 0) return;
  const action = redoStack.pop();
  undoStack.push(action);
  redraw();
});

// Clear board
clearBtn.addEventListener('click', () => {
  undoStack = [];
  redoStack = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Show modal to name file
downloadBtn.addEventListener('click', () => {
  filenameInput.value = 'studyverse-whiteboard'; // default filename
  downloadModal.style.display = 'flex';
  filenameInput.focus();
});

// Cancel modal
cancelBtn.addEventListener('click', () => {
  downloadModal.style.display = 'none';
});

// Download file with given filename
saveBtn.addEventListener('click', () => {
  let filename = filenameInput.value.trim();
  if (!filename) {
    alert('Please enter a filename.');
    filenameInput.focus();
    return;
  }

  if (!filename.toLowerCase().endsWith('.png')) {
    filename += '.png';
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();

  downloadModal.style.display = 'none';
});

// Close modal when clicking outside content
downloadModal.addEventListener('click', (e) => {
  if (e.target === downloadModal) {
    downloadModal.style.display = 'none';
  }
});

// Press Enter in input triggers download
filenameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    saveBtn.click();
  }
});

// Resize canvas on window resize
window.addEventListener('resize', resizeCanvas);

// Initial resize
resizeCanvas();
