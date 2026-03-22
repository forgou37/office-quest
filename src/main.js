import Phaser from 'phaser';
import { generateTileTextures, TILE_W, TILE_H } from './generateTiles.js';
import { FLOOR1_MAP, TILE_TEXTURES, WALKABLE, ROOM_LABELS, POI } from './floor1Map.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerGridX = 20;  // Start at entrance
    this.playerGridY = 28;
    this.isMoving = false;
    this.moveSpeed = 150; // ms per tile
  }

  preload() {
    // All textures generated at runtime
  }

  create() {
    generateTileTextures(this);

    // Camera setup
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Create tile map
    this.tileGroup = this.add.group();
    this.renderMap();

    // Create player
    const playerPos = this.gridToIso(this.playerGridX, this.playerGridY);
    this.player = this.add.image(playerPos.x, playerPos.y - 16, 'character');
    this.player.setDepth(1000);
    this.player.setScale(1);

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(0.9);

    // Room label text
    this.roomLabel = this.add.text(0, 0, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setPosition(10, 10).setDepth(2000);

    // Interaction hint
    this.hintText = this.add.text(0, 0, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffd700',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setPosition(10, 35).setDepth(2000);

    // Controls info
    this.add.text(0, 0, '← → ↑ ↓  рух  |  SPACE  взаємодія', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#888888',
    }).setScrollFactor(0).setPosition(10, 570).setDepth(2000);

    // Title
    this.add.text(0, 0, 'OFFICE QUEST', {
      fontSize: '16px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#e74c3c',
    }).setScrollFactor(0).setPosition(680, 10).setDepth(2000);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Dialog box
    this.dialogBox = null;
    this.dialogText = null;

    this.updateRoomLabel();
  }

  renderMap() {
    for (let y = 0; y < FLOOR1_MAP.length; y++) {
      for (let x = 0; x < FLOOR1_MAP[y].length; x++) {
        const tileType = FLOOR1_MAP[y][x];
        const textureName = TILE_TEXTURES[tileType];
        if (!textureName) continue;

        const pos = this.gridToIso(x, y);
        const tile = this.add.image(pos.x, pos.y, textureName);
        tile.setDepth(y + x); // Isometric depth sorting
        this.tileGroup.add(tile);
      }
    }

    // Render POI markers
    for (const poi of POI) {
      const pos = this.gridToIso(poi.x, poi.y);
      const marker = this.add.circle(pos.x, pos.y - 4, 4, 0xffd700, 0.8);
      marker.setDepth(9999);

      // Pulsing animation
      this.tweens.add({
        targets: marker,
        alpha: 0.3,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  gridToIso(gridX, gridY) {
    // Convert grid coordinates to isometric screen coordinates
    const isoX = (gridX - gridY) * (TILE_W / 2) + 600; // offset to center
    const isoY = (gridX + gridY) * (TILE_H / 2);
    return { x: isoX, y: isoY };
  }

  isoToGrid(isoX, isoY) {
    const adjustedX = isoX - 600;
    const gridX = Math.round((adjustedX / (TILE_W / 2) + isoY / (TILE_H / 2)) / 2);
    const gridY = Math.round((isoY / (TILE_H / 2) - adjustedX / (TILE_W / 2)) / 2);
    return { x: gridX, y: gridY };
  }

  canWalk(x, y) {
    if (y < 0 || y >= FLOOR1_MAP.length) return false;
    if (x < 0 || x >= FLOOR1_MAP[y].length) return false;
    return WALKABLE.has(FLOOR1_MAP[y][x]);
  }

  updateRoomLabel() {
    const tileType = FLOOR1_MAP[this.playerGridY]?.[this.playerGridX];
    const label = ROOM_LABELS[tileType] || '???';
    this.roomLabel.setText(`📍 ${label}`);

    // Check for nearby POI
    const nearbyPoi = POI.find(p =>
      Math.abs(p.x - this.playerGridX) <= 1 && Math.abs(p.y - this.playerGridY) <= 1
    );
    if (nearbyPoi) {
      this.hintText.setText(`✨ ${nearbyPoi.name} — натисни SPACE`);
      this.currentPoi = nearbyPoi;
    } else {
      this.hintText.setText('');
      this.currentPoi = null;
    }
  }

  movePlayer(dx, dy) {
    if (this.isMoving) return;

    const newX = this.playerGridX + dx;
    const newY = this.playerGridY + dy;

    if (!this.canWalk(newX, newY)) return;

    this.isMoving = true;
    this.playerGridX = newX;
    this.playerGridY = newY;

    const targetPos = this.gridToIso(newX, newY);

    // Animate movement
    this.tweens.add({
      targets: this.player,
      x: targetPos.x,
      y: targetPos.y - 16,
      duration: this.moveSpeed,
      ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.player.setDepth(newY * 100 + newX);
        this.updateRoomLabel();
      },
    });

    // Small bounce effect
    this.tweens.add({
      targets: this.player,
      scaleY: 1.1,
      duration: this.moveSpeed / 2,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  showDialog(title, text) {
    if (this.dialogBox) {
      this.dialogBox.destroy();
      this.dialogText.destroy();
      this.dialogTitle.destroy();
      this.dialogBox = null;
      return;
    }

    this.dialogBox = this.add.rectangle(400, 520, 700, 80, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(3000).setStrokeStyle(2, 0xffd700);

    this.dialogTitle = this.add.text(70, 490, title, {
      fontSize: '14px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffd700',
    }).setScrollFactor(0).setDepth(3001);

    this.dialogText = this.add.text(70, 510, text, {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ffffff',
      wordWrap: { width: 650 },
    }).setScrollFactor(0).setDepth(3001);
  }

  update() {
    // Close dialog on any movement
    if (this.dialogBox && (this.cursors.left.isDown || this.cursors.right.isDown ||
        this.cursors.up.isDown || this.cursors.down.isDown)) {
      this.dialogBox.destroy();
      this.dialogText.destroy();
      this.dialogTitle.destroy();
      this.dialogBox = null;
    }

    // Isometric movement mapping:
    // UP arrow = move up-left in grid (north in iso)
    // DOWN arrow = move down-right in grid (south in iso)
    // LEFT arrow = move down-left in grid (west in iso)
    // RIGHT arrow = move up-right in grid (east in iso)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.movePlayer(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.movePlayer(0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.movePlayer(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.movePlayer(1, 0);
    }

    // Interaction
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.currentPoi) {
      this.showDialog(this.currentPoi.name, this.currentPoi.desc);
    }

    // Hold-to-move (after initial press)
    if (!this.isMoving) {
      if (this.cursors.up.isDown && this.cursors.up.getDuration() > 200) {
        this.movePlayer(0, -1);
      } else if (this.cursors.down.isDown && this.cursors.down.getDuration() > 200) {
        this.movePlayer(0, 1);
      } else if (this.cursors.left.isDown && this.cursors.left.getDuration() > 200) {
        this.movePlayer(-1, 0);
      } else if (this.cursors.right.isDown && this.cursors.right.getDuration() > 200) {
        this.movePlayer(1, 0);
      }
    }
  }
}

// Game config
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: document.body,
  backgroundColor: '#1a1a2e',
  scene: [GameScene],
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);
