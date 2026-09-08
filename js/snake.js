(() => {
  const canvas = document.getElementById('game-board');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('game-overlay');
  const finalScoreEl = document.getElementById('final-score');
  const restartButton = document.getElementById('restart-button');
  const gridSize = 24;
  const cell = canvas.width / gridSize;
  const directions = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
  let snake, food, direction, nextDirection, score, level, gameOver, lastStep, animationId;
  let best = Number.parseInt(sessionStorage.getItem('neon-snake-best') || '0', 10);

  bestEl.textContent = format(best);

  function format(value) { return String(value).padStart(4, '0'); }
  function reset() {
    snake = [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
    food = { x: 17, y: 12 };
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    score = 0; level = 1; gameOver = false; lastStep = performance.now();
    overlay.hidden = true;
    updateHud();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  }
  function updateHud() { scoreEl.textContent = format(score); levelEl.textContent = String(level).padStart(2, '0'); bestEl.textContent = format(best); }
  function placeFood() {
    do { food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; }
    while (snake.some(part => part.x === food.x && part.y === food.y));
  }
  function step() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
    const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) return endGame();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score += 10; level = Math.floor(score / 50) + 1; if (score > best) { best = score; sessionStorage.setItem('neon-snake-best', String(best)); } placeFood(); updateHud(); }
    else snake.pop();
  }
  function endGame() { gameOver = true; finalScoreEl.textContent = format(score); overlay.hidden = false; draw(); }
  function loop(timestamp) {
    if (gameOver) return;
    const speed = Math.max(62, 145 - (level - 1) * 12);
    if (timestamp - lastStep >= speed) { step(); lastStep = timestamp; }
    draw();
    animationId = requestAnimationFrame(loop);
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#101912'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(151, 195, 119, .08)'; ctx.lineWidth = 1;
    for (let i = 1; i < gridSize; i++) { ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, canvas.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(canvas.width, i * cell); ctx.stroke(); }
    ctx.fillStyle = '#ff8e5e'; ctx.shadowColor = '#ff8e5e'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell * .3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    snake.forEach((part, index) => { const inset = index === 0 ? 2 : 3; ctx.fillStyle = index === 0 ? '#e1ff8e' : '#a8d85d'; ctx.fillRect(part.x * cell + inset, part.y * cell + inset, cell - inset * 2, cell - inset * 2); if (index === 0) { ctx.fillStyle = '#304234'; const eyeOffsetX = direction.x === 0 ? 5 : direction.x * 5; const eyeOffsetY = direction.y === 0 ? 5 : direction.y * 5; ctx.fillRect(part.x * cell + cell / 2 + eyeOffsetX - 2, part.y * cell + cell / 2 + eyeOffsetY - 2, 4, 4); } });
  }
  window.addEventListener('keydown', event => { const requested = directions[event.key]; if (!requested || gameOver) return; event.preventDefault(); if (requested.x + direction.x !== 0 || requested.y + direction.y !== 0) nextDirection = requested; });
  restartButton.addEventListener('click', reset);
  reset();
})();
