const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

// original dimensions
const originalWidth = 431;
const originalHeight = 768;

// scale factor
let scale = 1;

const resize = () => {
  scale = window.innerWidth / originalWidth;
  canvas.width = originalWidth * scale;
  canvas.height = originalHeight * scale;
}
window.addEventListener('resize', resize);
resize(); // initial call

// general settings
let gamePlaying = false;
const gravity = 0.5;
const speed = 2.2;
const size = [51, 36];
const jump = -11.5;
const cTenth = originalWidth / 10;

let index = 0,
    bestScore = 0, 
    flight, 
    flyHeight, 
    currentScore, 
    pipes = [];

// pipe settings
const pipeWidth = 78;
const pipeGap = 270;
const pipeLoc = () => (Math.random() * ((originalHeight - (pipeGap + pipeWidth)) - pipeWidth)) + pipeWidth;

const setup = () => {
  currentScore = 0;
  flight = jump;
  flyHeight = (originalHeight / 2) - (size[1] / 2);
  pipes = Array(3).fill().map((_, i) => [originalWidth + (i * (pipeGap + pipeWidth)), pipeLoc()]);
}

// handle flap
const flap = (e) => {
  e.preventDefault(); // evita que touch también genere click
  gamePlaying = true;
  flight = jump;
}

// usar solo touchstart si es táctil, sino click
if ('ontouchstart' in window) {
  document.addEventListener('touchstart', flap, {passive: false});
} else {
  document.addEventListener('click', flap);
}

const render = () => {
  index++;

  ctx.save();
  ctx.scale(scale, scale); // scale everything

  // draw background
  ctx.drawImage(img, 0, 0, originalWidth, originalHeight, -((index * (speed / 2)) % originalWidth) + originalWidth, 0, originalWidth, originalHeight);
  ctx.drawImage(img, 0, 0, originalWidth, originalHeight, -(index * (speed / 2)) % originalWidth, 0, originalWidth, originalHeight);

  if (gamePlaying) {
    pipes.forEach((pipe, i) => {
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
      // bottom pipe
      ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, originalHeight - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, originalHeight - pipe[1] + pipeGap);

      // score & new pipe
      if (pipe[0] <= -pipeWidth) {
        currentScore++;
        bestScore = Math.max(bestScore, currentScore);
        pipes = [...pipes.slice(1), [pipes[pipes.length -1][0] + pipeGap + pipeWidth, pipeLoc()]];
      }

      // collision
      if (
        cTenth + size[0] > pipe[0] &&
        cTenth < pipe[0] + pipeWidth &&
        (flyHeight < pipe[1] || flyHeight + size[1] > pipe[1] + pipeGap)
      ) {
        gamePlaying = false;
        setup();
      }
    });

    // draw bird
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, originalHeight - size[1]);

  } else {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, (originalWidth / 2) - size[0] / 2, flyHeight, ...size);
    flyHeight = (originalHeight / 2) - (size[1] / 2);

    ctx.font = "bold 30px courier";
    ctx.fillStyle = "#000";
    ctx.fillText(`Best score: ${bestScore}`, 85, 245);
    ctx.fillText('Click or Tap to play', 40, 535);
  }

  document.getElementById('bestScore').innerHTML = `Score: ${bestScore}`;
  document.getElementById('currentScore').innerHTML = `Current: ${currentScore}`;

  ctx.restore();

  window.requestAnimationFrame(render);
}

setup();
img.onload = render;
