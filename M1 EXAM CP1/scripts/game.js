const config = {
  type: Phaser.CANVAS,
  width: 1200,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let platforms;
let ustar;
let player;
let stars;
let bombs;
let scoreText;
let score = 0;
let colorIndex = 0;
let colors = ['0xff0000', '0xffa500', '0xffff00', '0x00ff00', '0x0000ff', '0x4b0082', '0x9400d3'];
let starCollected = 0;
let gameOver = false;

function preload() {
  this.load.spritesheet('player', 'assets/character/Slime1.png', { frameWidth: 32, frameHeight: 32 });
  this.load.image('star', 'assets/stars/starr.png');
  this.load.image('bomb', 'assets/bomb/bomba.png');
  this.load.image('background', 'assets/background/forest.jpg');
  this.load.image('platform', 'assets/platf/plat.png');
  this.load.image('ustar', 'assets/ustar/pstar.png')
}

function create() {
  this.add.image(400, 300, 'background');

  platforms = this.physics.add.staticGroup();

  let platformPositions = [
    { x: 200, y: 500, width: 500 },
    { x: 600, y: 400, width: 400 },
    { x: 400, y: 300, width: 300 },
    { x: 800, y: 200, width: 200 },
    { x: 1000, y: 100, width: 600 }
  ];

  platformPositions.forEach(pos => {
    let platform = platforms.create(pos.x, pos.y, 'platform').setDisplaySize(pos.width, 20);
    platform.refreshBody();
  });

  ustar = this.add.image(1100, 65, "ustar").setScale(1);
  function checkWin(player, ustar) {
    if (score === 7) {
      gameOver = true;
      this.physics.pause();
      player.setTint(0x00ff00); // Change player color to green
      this.add.text(300, 300, 'You Win!', { fontSize: '64px', fill: '#000' });
    }
  }

  player = this.physics.add.sprite(100, 500, 'player');
  player.setCollideWorldBounds(true);

  stars = this.physics.add.group();
  bombs = this.physics.add.group();

  for (let i = 0; i < 7; i++) {
    let x = Phaser.Math.Between(100, 1100);
    let y = Phaser.Math.Between(-600, -100);
    let star = stars.create(x, y, 'star').setScale(0.3);
    star.body.setBounce(1);
    star.body.setVelocityY(Math.random() * 100 + 50);
  }

  for (let i = 0; i < 5; i++) {
    let x = Phaser.Math.Between(100, 1100);
    let y = Phaser.Math.Between(-600, -100);
    let bomb = bombs.create(x, y, 'bomb').setScale(2);
    bomb.body.setBounce(.95);
    bomb.body.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }

  // Add colliders between player, stars, bombs, and platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, stars, hitStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  scoreText = this.add.text(16, 16, 'Stars Collected: 0', { fontSize: '32px', fill: '#000' });

  this.input.keyboard.on('keydown-A', function (event) {
    player.setVelocityX(-160);
    player.setFlipX(true);
  });

  this.input.keyboard.on('keydown-D', function (event) {
    player.setVelocityX(160);
    player.setFlipX(false);
  });

  this.input.keyboard.on('keydown-SPACE', function (event) {
    if (player.body.onFloor()) {
      player.setVelocityY(-330);
    }
  });

  this.time.addEvent({ delay: 3000, callback: createBomb, callbackScope: this, loop: true });
}



function update(time, delta) {
  if (!gameOver) {
    if (player.body.velocity.x !== 0) {
      player.anims.play('left', true);
    } else {
      player.anims.play('turn');
    }
  }

  stars.children.iterate(function (child) {
    if (child.y > 600) {
      child.disableBody(true, true);
      if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
        });
      }
    }
  });

  scoreText.setText('Stars Collected: ' + score);
}

function hitStar(player, star) {
  star.disableBody(true, true);
  score++;
  starCollected++;

  // Change character's color based on the collected stars
  if (score % 7 === 0) {
    colorIndex++;
    if (colorIndex === colors.length) {
      colorIndex = 0;
    }
    player.setTint(colors[colorIndex]);
  }

  // Check if it's time to increase character's size
  if (starCollected === 7) {
    player.setScale(player.scaleX + 0.1, player.scaleY + 0.1);
    starCollected = 0;
  }

  scoreText.setText('Stars Collected: ' + score);
}

function checkWin(player, ustar) {
  if (score === 7) {
    gameOver = true;
    this.physics.pause();
    player.setTint(0x00ff00); // Change player color to green
    this.add.text(300, 300, 'You Win!', { fontSize: '64px', fill: '#000' });
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  gameOver = true;
  this.add.text(300, 300, 'Game Over', { fontSize: '64px', fill: '#000' });
}

function createBomb() {
  let bomb = bombs.create(Phaser.Math.Between(100, 1100), 5, 'bomb');
  bomb.setScale(2);
  bomb.setBounce(1);
  bomb.setCollideWorldBounds(true);
  bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
}
