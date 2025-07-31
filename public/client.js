/*!
 * Four-in-a-Row Client Logic
 * Author: Canon Leahy
 * Date: 2025-07-31
 */

// ========== TokenState ==========

const TokenState = (() => {
  function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes("OPR")) return "Opera";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    return "Firefox";
  }

  function setToken(name) {
    return { user: name, browser: getBrowserName(), timestamp: Date.now() };
  }

  async function putToken(token) {
    const res = await fetch('/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token)
    });
    return res.ok;
  }

  async function getToken() {
    const res = await fetch('/token');
    return await res.json();
  }

  return { setToken, putToken, getToken };
})();

// ========== Game Logic ==========

/**
 * @param {string[]} board - 16-element array with "", "O", or "X"
 * @returns {{winner: string, stripe: number[]} | null}
 */
function checkWin(board) {
  const s = [
    [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
    [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
    [0,5,10,15],[3,6,9,12]
  ];
  for (const [a,b,c,d] of s) {
    if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]) {
      return { winner: board[a], stripe: [a,b,c,d] };
    }
  }
  return null;
}

// ========== GUI Logic ==========

const boardEl = document.getElementById('board');
const controlBtn = document.getElementById('controlBtn');
let state = null;
let myToken = null;

async function loadState() {
  const res = await fetch('/state');
  const s = await res.json();
  state = s || {
    board: Array(16).fill(''),
    start: null,
    next: null,
    status: 'needFlip',
    winner: null,
    stripe: [],
    timestamp: Date.now()
  };
}

async function saveState() {
  state.timestamp = Date.now();
  await fetch('/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state)
  });
}

function createBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 4; r++) {
    const row = document.createElement('tr');
    for (let c = 0; c < 4; c++) {
      const cell = document.createElement('td');
      cell.dataset.idx = r * 4 + c;
      cell.addEventListener('click', onCellClick);
      row.appendChild(cell);
    }
    boardEl.appendChild(row);
  }
}

function render() {
  state.board.forEach((val, i) => {
    const td = boardEl.querySelector(`td[data-idx="${i}"]`);
    td.textContent = val || '';
    td.className = '';
  });
  if (state.stripe?.length) {
    state.stripe.forEach(i => boardEl.querySelector(`td[data-idx="${i}"]`).classList.add('winner'));
  }
  controlBtn.textContent =
    state.status === 'needFlip' ? 'Flip' :
    state.status === 'playing'  ? 'Clear' : 'Start';
}

async function onCellClick(e) {
  if (state.status !== 'playing') return;
  if (!isMyTurn()) return;

  const idx = parseInt(e.target.dataset.idx, 10);
  if (state.board[idx]) return;
  state.board[idx] = state.next;

  const win = checkWin(state.board);
  if (win) {
    state.status = 'over';
    state.winner = win.winner;
    state.stripe = win.stripe;
    state.start = win.winner;
  } else if (!state.board.includes('')) {
    state.status = 'over';
    state.winner = null;
    state.stripe = [];
  } else {
    state.next = state.next === 'O' ? 'X' : 'O';
  }

  await saveState();
  render();
}

controlBtn.addEventListener('click', async () => {
  if (state.status === 'needFlip') {
    state.start = Math.random() < 0.5 ? 'O' : 'X';
    state.next = state.start;
    state.board = Array(16).fill('');
    state.status = 'ready';
  } else if (state.status === 'playing') {
    state.board = Array(16).fill('');
    state.status = 'ready';
    state.winner = null;
    state.stripe = [];
  } else { // ready or over
    if (isMyTurn()) {
      state.board = Array(16).fill('');
      state.next = state.start;
      state.status = 'playing';
      state.winner = null;
      state.stripe = [];
    }
  }

  await saveState();
  render();
});

function isMyTurn() {
  return myToken && state.next && state.status === 'playing' &&
    ((state.next === 'O' && myToken.user === 'O') ||
     (state.next === 'X' && myToken.user === 'X'));
}

function poll() {
  setInterval(async () => {
    const res = await fetch('/state');
    const newState = await res.json();
    if (!state || newState.timestamp !== state.timestamp) {
      state = newState;
      render();
    }
  }, 1000);
}

(async function init() {
  const name = prompt("Enter your symbol: O or X");
  myToken = TokenState.setToken(name);
  await TokenState.putToken(myToken);
  await loadState();
  createBoard();
  render();
  poll();
})();
