// Criar canvas
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Funções de carregamento
function carregarImagem(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function carregarSom(src) {
  const audio = new Audio(src);
  return audio;
}

// Objetos do jogo
const hero = { x: 0, y: 0, speed: 256 };
const monstros = [];
let monsterPegos = 0;
let nivel = 1;
const keysDown = {};
const obstaculos = [
  { x: 200, y: 200, largura: 50, altura: 50 },
  { x: 350, y: 100, largura: 100, altura: 20 },
  { x: 150, y: 350, largura: 80, altura: 40 }
];

// Sons
const somPegar = carregarSom("audio/pickup.mp3");
const somVitoria = carregarSom("audio/win.mp3");

// Controles do teclado
window.addEventListener("keydown", e => keysDown[e.key] = true);
window.addEventListener("keyup", e => delete keysDown[e.key]);

// Resetar posições
function resetPositions() {
  hero.x = canvas.width / 2;
  hero.y = canvas.height / 2;

  monstros.length = 0;
  for (let i = 0; i < nivel + 2; i++) {
    monstros.push({
      x: 32 + Math.random() * (canvas.width - 64),
      y: 32 + Math.random() * (canvas.height - 64)
    });
  }
}

// Checar colisão com obstáculos
function checkCollision(x, y) {
  for (let obs of obstaculos) {
    if (x < obs.x + obs.largura &&
        x + 32 > obs.x &&
        y < obs.y + obs.altura &&
        y + 32 > obs.y) {
      return true;
    }
  }
  return false;
}

// Atualizar herói, monstros e níveis
function update(delta) {
  let newX = hero.x;
  let newY = hero.y;

  if ("w" in keysDown) newY -= hero.speed * delta;
  if ("s" in keysDown) newY += hero.speed * delta;
  if ("a" in keysDown) newX -= hero.speed * delta;
  if ("d" in keysDown) newX += hero.speed * delta;

  if (!checkCollision(newX, hero.y) && newX >= 0 && newX <= canvas.width - 32) hero.x = newX;
  if (!checkCollision(hero.x, newY) && newY >= 0 && newY <= canvas.height - 32) hero.y = newY;

  for (let monstro of monstros) {
    if (
      hero.x <= monstro.x + 32 &&
      monstro.x <= hero.x + 32 &&
      hero.y <= monstro.y + 32 &&
      monstro.y <= hero.y + 32
    ) {
      monsterPegos++;
      somPegar.play();
      monstro.x = 32 + Math.random() * (canvas.width - 64);
      monstro.y = 32 + Math.random() * (canvas.height - 64);
    }
  }

  // Avançar nível a cada 5 monstros
  if (monsterPegos > 0 && monsterPegos % 5 === 0) {
    nivel = Math.floor(monsterPegos / 5) + 1;
    resetPositions();
  }
}

// Renderizar o jogo
function render(backgroundImage, heroImg, monsterImg) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0);

  // Obstáculos
  ctx.fillStyle = "brown";
  for (let obs of obstaculos) {
    ctx.fillRect(obs.x, obs.y, obs.largura, obs.altura);
  }

  // Herói
  ctx.drawImage(heroImg, hero.x, hero.y);

  // Monstros
  for (let monstro of monstros) {
    ctx.drawImage(monsterImg, monstro.x, monstro.y);
  }

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "24px Helvetica";
  ctx.fillText("Monstros pegos: " + monsterPegos, 32, 32);
  ctx.fillText("Nível: " + nivel, 32, 60);

  // Tela de vitória
  if (monsterPegos >= 20) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "yellow";
    ctx.font = "48px Helvetica";
    ctx.textAlign = "center";
    ctx.fillText("Você Venceu!", canvas.width / 2, canvas.height / 2);
    somVitoria.play();
  }
}

// Loop principal
function main(backgroundImage, heroImg, monsterImg) {
  let then = performance.now();

  function loop(now) {
    const delta = (now - then) / 1000;
    if (monsterPegos < 20) {
      update(delta);
    }
    render(backgroundImage, heroImg, monsterImg);
    then = now;
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// Inicialização
async function startGame() {
  const [backgroundImage, heroImg, monsterImg] = await Promise.all([
    carregarImagem("img/background.png"),
    carregarImagem("img/hero.png"),
    carregarImagem("img/bomb.png")
  ]);

  resetPositions();
  main(backgroundImage, heroImg, monsterImg);
}

// Começar o jogo
startGame();
