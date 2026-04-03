import Phaser from 'phaser';
import { generateTileTextures, generateCharSprite, generateItemSprites, TILE_W, TILE_H } from './generateTiles.js';
import { FLOOR1_MAP, TILE_TEXTURES, WALKABLE, ROOM_LABELS, POI } from './floor1Map.js';
import { QuestManager, QUESTS } from './questSystem.js';
import { Inventory, ITEM_DEFS } from './inventorySystem.js';
import { NPC_DEFS, getNpcDialog } from './npcSystem.js';
import { WORLD_ITEMS } from './worldItems.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerGridX = 20;
    this.playerGridY = 35;
    this.isMoving = false;
    this.moveSpeed = 150;
    // Dialog state
    this.dialogActive = false;
    this.dialogChoices = [];
    this.dialogNpcId = null;
    // Click-to-move path
    this.currentPath = null;
    this.pathIndex = 0;
    this.pendingInteraction = null;
    // Systems
    this.questManager = new QuestManager();
    this.inventory = new Inventory();
    // NPC sprites
    this.npcSprites = {};
    this.npcLabels = {};
    // World item sprites
    this.worldItemSprites = {};
  }

  preload() {}

  create() {
    generateTileTextures(this);
    generateItemSprites(this);

    // Generate NPC textures
    for (const npc of Object.values(NPC_DEFS)) {
      generateCharSprite(this, `npc_${npc.id}`, npc.color, npc.hairColor);
    }

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Tile map
    this.tileGroup = this.add.group();
    this.renderMap();

    // Create NPCs
    this.createNpcs();

    // Create world items
    this.createWorldItems();

    // Player
    const playerPos = this.gridToIso(this.playerGridX, this.playerGridY);
    this.player = this.add.image(playerPos.x, playerPos.y - 16, 'character');
    this.player.setDepth(1000);
    this.player.setScale(2);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.2);

    // --- UI Layer ---
    // Room label
    this.roomLabel = this.add.text(10, 10, '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(2000);

    // Interaction hint
    this.hintText = this.add.text(10, 35, '', {
      fontSize: '12px', fontFamily: 'monospace', color: '#ffd700',
      backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(2000);

    // Controls
    this.add.text(10, 770, '🖱️ клік — рух/взаємодія  |  ← → ↑ ↓  рух  |  SPACE  взаємодія  |  1/2/3  вибір', {
      fontSize: '11px', fontFamily: 'monospace', color: '#888888',
    }).setScrollFactor(0).setDepth(2000);

    // Title
    this.add.text(1100, 10, 'OFFICE QUEST', {
      fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold', color: '#e74c3c',
    }).setScrollFactor(0).setDepth(2000);

    // Quest log panel (right side)
    this.questLogBg = this.add.rectangle(1190, 120, 200, 180, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(2000).setStrokeStyle(1, 0xe74c3c);
    this.questLogTitle = this.add.text(1095, 40, '📋 КВЕСТИ', {
      fontSize: '12px', fontFamily: 'monospace', fontStyle: 'bold', color: '#e74c3c',
    }).setScrollFactor(0).setDepth(2001);
    this.questLogText = this.add.text(1095, 58, '', {
      fontSize: '10px', fontFamily: 'monospace', color: '#cccccc',
      wordWrap: { width: 185 }, lineSpacing: 4,
    }).setScrollFactor(0).setDepth(2001);

    // Inventory panel (bottom)
    this.inventoryBg = this.add.rectangle(200, 740, 380, 40, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(2000).setStrokeStyle(1, 0xffd700);
    this.inventoryTitle = this.add.text(15, 725, '🎒', {
      fontSize: '14px', fontFamily: 'monospace',
    }).setScrollFactor(0).setDepth(2001);
    this.inventoryText = this.add.text(40, 730, 'Інвентар порожній', {
      fontSize: '11px', fontFamily: 'monospace', color: '#ffd700',
    }).setScrollFactor(0).setDepth(2001);

    // Notification text (center top, fades out)
    this.notifText = this.add.text(640, 80, '', {
      fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#2ecc71', backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 12, y: 6 },
    }).setScrollFactor(0).setDepth(3500).setOrigin(0.5, 0).setAlpha(0);

    // Dialog system UI elements (created on demand)
    this.dialogBox = null;
    this.dialogTitle = null;
    this.dialogText = null;
    this.dialogChoiceTexts = [];

    // Mouse click-to-move
    this.input.on('pointerdown', (pointer) => {
      if (this.dialogActive) {
        // Click closes dialog if no choices
        if (this.dialogChoices.length === 0) {
          this.closeDialog();
        }
        return;
      }
      if (this.isMoving) {
        // Cancel current path and start new one
        this.currentPath = null;
      }

      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      const grid = this.isoToGrid(worldX, worldY);

      // Check if clicked on NPC — interact instead of moving
      for (const npc of Object.values(NPC_DEFS)) {
        if (npc.gridX === grid.x && npc.gridY === grid.y) {
          // Walk to adjacent tile, then interact
          const adjTiles = [
            { x: npc.gridX, y: npc.gridY - 1 },
            { x: npc.gridX, y: npc.gridY + 1 },
            { x: npc.gridX - 1, y: npc.gridY },
            { x: npc.gridX + 1, y: npc.gridY },
          ].filter(t => this.canWalk(t.x, t.y));

          if (adjTiles.length > 0) {
            // Find closest adjacent tile
            adjTiles.sort((a, b) => {
              const da = Math.abs(a.x - this.playerGridX) + Math.abs(a.y - this.playerGridY);
              const db = Math.abs(b.x - this.playerGridX) + Math.abs(b.y - this.playerGridY);
              return da - db;
            });
            const target = adjTiles[0];
            // Already adjacent?
            if (target.x === this.playerGridX && target.y === this.playerGridY) {
              this.showNpcDialog(npc);
            } else {
              const path = this.findPath(this.playerGridX, this.playerGridY, target.x, target.y);
              if (path) {
                this.pendingInteraction = { type: 'npc', data: npc };
                this.moveAlongPath(path);
              }
            }
          }
          return;
        }
      }

      // Check if clicked on a visible world item
      for (const item of Object.values(WORLD_ITEMS)) {
        const sprite = this.worldItemSprites[item.id];
        if (sprite && sprite.visible && item.gridX === grid.x && item.gridY === grid.y) {
          const adjTiles = [
            { x: item.gridX, y: item.gridY - 1 },
            { x: item.gridX, y: item.gridY + 1 },
            { x: item.gridX - 1, y: item.gridY },
            { x: item.gridX + 1, y: item.gridY },
            { x: item.gridX, y: item.gridY },
          ].filter(t => this.canWalk(t.x, t.y));

          if (adjTiles.length > 0) {
            adjTiles.sort((a, b) => {
              const da = Math.abs(a.x - this.playerGridX) + Math.abs(a.y - this.playerGridY);
              const db = Math.abs(b.x - this.playerGridX) + Math.abs(b.y - this.playerGridY);
              return da - db;
            });
            const target = adjTiles[0];
            if (target.x === this.playerGridX && target.y === this.playerGridY) {
              this.pickupItem(item);
            } else {
              const path = this.findPath(this.playerGridX, this.playerGridY, target.x, target.y);
              if (path) {
                this.pendingInteraction = { type: 'item', data: item };
                this.moveAlongPath(path);
              }
            }
          }
          return;
        }
      }

      // Check POI
      const clickedPoi = POI.find(p => p.x === grid.x && p.y === grid.y);
      if (clickedPoi) {
        const adjTiles = [
          { x: clickedPoi.x, y: clickedPoi.y - 1 },
          { x: clickedPoi.x, y: clickedPoi.y + 1 },
          { x: clickedPoi.x - 1, y: clickedPoi.y },
          { x: clickedPoi.x + 1, y: clickedPoi.y },
          { x: clickedPoi.x, y: clickedPoi.y },
        ].filter(t => this.canWalk(t.x, t.y));

        if (adjTiles.length > 0) {
          adjTiles.sort((a, b) => {
            const da = Math.abs(a.x - this.playerGridX) + Math.abs(a.y - this.playerGridY);
            const db = Math.abs(b.x - this.playerGridX) + Math.abs(b.y - this.playerGridY);
            return da - db;
          });
          const target = adjTiles[0];
          if (target.x === this.playerGridX && target.y === this.playerGridY) {
            this.showSimpleDialog(clickedPoi.name, clickedPoi.desc);
          } else {
            const path = this.findPath(this.playerGridX, this.playerGridY, target.x, target.y);
            if (path) {
              this.pendingInteraction = { type: 'poi', data: clickedPoi };
              this.moveAlongPath(path);
            }
          }
        }
        return;
      }

      // Just walk there
      if (this.canWalk(grid.x, grid.y)) {
        const path = this.findPath(this.playerGridX, this.playerGridY, grid.x, grid.y);
        if (path) {
          this.pendingInteraction = null;
          this.moveAlongPath(path);
        }
      }
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // React to system changes
    this.questManager.onChange(() => {
      this.updateQuestLog();
      this.refreshWorldItems();
    });
    this.inventory.onChange(() => this.updateInventoryUI());

    this.updateRoomLabel();
    this.updateQuestLog();
    this.updateInventoryUI();
  }

  // === MAP ===
  renderMap() {
    for (let y = 0; y < FLOOR1_MAP.length; y++) {
      for (let x = 0; x < FLOOR1_MAP[y].length; x++) {
        const tileType = FLOOR1_MAP[y][x];
        const textureName = TILE_TEXTURES[tileType];
        if (!textureName) continue;
        const pos = this.gridToIso(x, y);
        const tile = this.add.image(pos.x, pos.y, textureName);
        tile.setDepth(y + x);
        this.tileGroup.add(tile);
      }
    }
    // POI markers
    for (const poi of POI) {
      const pos = this.gridToIso(poi.x, poi.y);
      const marker = this.add.circle(pos.x, pos.y - 4, 4, 0xffd700, 0.8);
      marker.setDepth(9999);
      this.tweens.add({
        targets: marker, alpha: 0.3, duration: 800, yoyo: true, repeat: -1,
      });
    }
  }

  // === NPC ===
  createNpcs() {
    for (const npc of Object.values(NPC_DEFS)) {
      const pos = this.gridToIso(npc.gridX, npc.gridY);
      const sprite = this.add.image(pos.x, pos.y - 16, `npc_${npc.id}`);
      sprite.setDepth(npc.gridY * 100 + npc.gridX);
      this.npcSprites[npc.id] = sprite;

      // Name label above NPC
      const label = this.add.text(pos.x, pos.y - 38, npc.name, {
        fontSize: '10px', fontFamily: 'monospace', fontStyle: 'bold',
        color: npc.color, backgroundColor: 'rgba(0,0,0,0.6)',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5, 0.5).setDepth(npc.gridY * 100 + npc.gridX + 1);
      this.npcLabels[npc.id] = label;

      // Idle animation — slight bob
      this.tweens.add({
        targets: sprite, y: pos.y - 18, duration: 1200 + Math.random() * 400,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
  }

  // === WORLD ITEMS ===
  createWorldItems() {
    for (const item of Object.values(WORLD_ITEMS)) {
      const pos = this.gridToIso(item.gridX, item.gridY);
      const sprite = this.add.image(pos.x, pos.y - 6, `item_${item.id}`);
      sprite.setDepth(item.gridY * 100 + item.gridX + 50);
      sprite.setVisible(false);

      // Glow/pulse
      this.tweens.add({
        targets: sprite, alpha: 0.5, duration: 600, yoyo: true, repeat: -1,
      });

      this.worldItemSprites[item.id] = sprite;
    }
    this.refreshWorldItems();
  }

  refreshWorldItems() {
    for (const item of Object.values(WORLD_ITEMS)) {
      const sprite = this.worldItemSprites[item.id];
      if (sprite) {
        sprite.setVisible(item.visibleWhen(this.questManager));
      }
    }
  }

  // === COORDINATE CONVERSION ===
  gridToIso(gridX, gridY) {
    const isoX = (gridX - gridY) * (TILE_W / 2) + 900;
    const isoY = (gridX + gridY) * (TILE_H / 2);
    return { x: isoX, y: isoY };
  }

  isoToGrid(worldX, worldY) {
    const a = (worldX - 900) / (TILE_W / 2);
    const b = worldY / (TILE_H / 2);
    return {
      x: Math.round((a + b) / 2),
      y: Math.round((b - a) / 2),
    };
  }

  // === A* PATHFINDING ===
  findPath(sx, sy, tx, ty) {
    if (!this.canWalk(tx, ty)) return null;

    const key = (x, y) => `${x},${y}`;
    const open = [{ x: sx, y: sy, g: 0, h: 0, f: 0, parent: null }];
    const closed = new Set();

    const heuristic = (x, y) => Math.abs(x - tx) + Math.abs(y - ty);
    open[0].h = heuristic(sx, sy);
    open[0].f = open[0].h;

    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
    ];

    while (open.length > 0) {
      // Find lowest f
      let bestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[bestIdx].f) bestIdx = i;
      }
      const current = open.splice(bestIdx, 1)[0];

      if (current.x === tx && current.y === ty) {
        // Reconstruct path (skip start position)
        const path = [];
        let node = current;
        while (node.parent) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }

      closed.add(key(current.x, current.y));

      for (const dir of dirs) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        if (closed.has(key(nx, ny))) continue;
        if (!this.canWalk(nx, ny)) continue;
        // Prevent diagonal corner-cutting through walls
        if (dir.dx !== 0 && dir.dy !== 0) {
          if (!this.canWalk(current.x + dir.dx, current.y) ||
              !this.canWalk(current.x, current.y + dir.dy)) continue;
        }

        const isDiag = dir.dx !== 0 && dir.dy !== 0;
        const g = current.g + (isDiag ? 1.41 : 1);
        const existing = open.find(n => n.x === nx && n.y === ny);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = g + existing.h;
            existing.parent = current;
          }
        } else {
          const h = heuristic(nx, ny);
          open.push({ x: nx, y: ny, g, h, f: g + h, parent: current });
        }
      }

      // Safety: don't search forever
      if (closed.size > 2000) return null;
    }
    return null;
  }

  // === CLICK-TO-MOVE ===
  moveAlongPath(path) {
    if (!path || path.length === 0) return;
    this.currentPath = path;
    this.pathIndex = 0;
    this.stepPath();
  }

  stepPath() {
    if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
      this.currentPath = null;
      this.pathIndex = 0;
      return;
    }

    const next = this.currentPath[this.pathIndex];

    // Check if path is still valid (something might have changed)
    if (!this.canWalk(next.x, next.y)) {
      this.currentPath = null;
      return;
    }

    this.isMoving = true;
    this.playerGridX = next.x;
    this.playerGridY = next.y;
    const targetPos = this.gridToIso(next.x, next.y);

    this.tweens.add({
      targets: this.player, x: targetPos.x, y: targetPos.y - 16,
      duration: this.moveSpeed, ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.player.setDepth(next.y * 100 + next.x);
        this.updateRoomLabel();
        this.pathIndex++;
        // Continue walking if no dialog triggered and path exists
        if (!this.dialogActive && this.currentPath) {
          if (this.pathIndex >= this.currentPath.length) {
            // Path complete — trigger pending interaction
            this.currentPath = null;
            if (this.pendingInteraction) {
              const pi = this.pendingInteraction;
              this.pendingInteraction = null;
              if (pi.type === 'npc') this.showNpcDialog(pi.data);
              else if (pi.type === 'item') this.pickupItem(pi.data);
              else if (pi.type === 'poi') this.showSimpleDialog(pi.data.name, pi.data.desc);
            }
          } else {
            this.stepPath();
          }
        }
      },
    });
    // Walk bounce
    this.tweens.add({
      targets: this.player, scaleY: 1.1,
      duration: this.moveSpeed / 2, yoyo: true, ease: 'Sine.easeInOut',
    });
  }

  canWalk(x, y) {
    if (y < 0 || y >= FLOOR1_MAP.length) return false;
    if (x < 0 || x >= FLOOR1_MAP[y].length) return false;
    // Block walking into NPC tiles
    for (const npc of Object.values(NPC_DEFS)) {
      if (npc.gridX === x && npc.gridY === y) return false;
    }
    return WALKABLE.has(FLOOR1_MAP[y][x]);
  }

  // === MOVEMENT ===
  movePlayer(dx, dy) {
    if (this.isMoving || this.dialogActive) return;
    const newX = this.playerGridX + dx;
    const newY = this.playerGridY + dy;
    if (!this.canWalk(newX, newY)) return;

    this.isMoving = true;
    this.playerGridX = newX;
    this.playerGridY = newY;
    const targetPos = this.gridToIso(newX, newY);

    this.tweens.add({
      targets: this.player, x: targetPos.x, y: targetPos.y - 16,
      duration: this.moveSpeed, ease: 'Linear',
      onComplete: () => {
        this.isMoving = false;
        this.player.setDepth(newY * 100 + newX);
        this.updateRoomLabel();
      },
    });
    this.tweens.add({
      targets: this.player, scaleY: 1.1,
      duration: this.moveSpeed / 2, yoyo: true, ease: 'Sine.easeInOut',
    });
  }

  // === LABELS & HINTS ===
  updateRoomLabel() {
    const tileType = FLOOR1_MAP[this.playerGridY]?.[this.playerGridX];
    const label = ROOM_LABELS[tileType] || '???';
    this.roomLabel.setText(`📍 ${label}`);

    // Check nearby NPC
    const nearbyNpc = this.findNearbyNpc();
    const nearbyItem = this.findNearbyItem();
    const nearbyPoi = POI.find(p =>
      Math.abs(p.x - this.playerGridX) <= 1 && Math.abs(p.y - this.playerGridY) <= 1
    );

    if (nearbyNpc) {
      this.hintText.setText(`💬 ${nearbyNpc.name} — натисни SPACE`);
      this.currentPoi = null;
      this.currentNpc = nearbyNpc;
      this.currentItem = null;
    } else if (nearbyItem) {
      this.hintText.setText(`✨ ${nearbyItem.name} — натисни SPACE`);
      this.currentPoi = null;
      this.currentNpc = null;
      this.currentItem = nearbyItem;
    } else if (nearbyPoi) {
      this.hintText.setText(`✨ ${nearbyPoi.name} — натисни SPACE`);
      this.currentPoi = nearbyPoi;
      this.currentNpc = null;
      this.currentItem = null;
    } else {
      this.hintText.setText('');
      this.currentPoi = null;
      this.currentNpc = null;
      this.currentItem = null;
    }
  }

  findNearbyNpc() {
    for (const npc of Object.values(NPC_DEFS)) {
      if (Math.abs(npc.gridX - this.playerGridX) <= 1 &&
          Math.abs(npc.gridY - this.playerGridY) <= 1) {
        return npc;
      }
    }
    return null;
  }

  findNearbyItem() {
    for (const item of Object.values(WORLD_ITEMS)) {
      const sprite = this.worldItemSprites[item.id];
      if (sprite && sprite.visible &&
          Math.abs(item.gridX - this.playerGridX) <= 1 &&
          Math.abs(item.gridY - this.playerGridY) <= 1) {
        return item;
      }
    }
    return null;
  }

  // === DIALOG SYSTEM ===
  showNpcDialog(npcDef) {
    const dialog = getNpcDialog(npcDef, this.questManager, this.inventory);
    if (!dialog) return;

    this.dialogActive = true;
    this.dialogNpcId = npcDef.id;
    this.dialogChoices = dialog.choices || [];

    // Clear previous
    this.closeDialog(true);

    // Dialog box
    this.dialogBox = this.add.rectangle(440, 620, 800, 100, 0x000000, 0.9)
      .setScrollFactor(0).setDepth(3000).setStrokeStyle(2, 0xffd700);

    this.dialogTitle = this.add.text(55, 580, `💬 ${npcDef.name}`, {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', color: npcDef.color,
    }).setScrollFactor(0).setDepth(3001);

    this.dialogText = this.add.text(55, 600, dialog.text, {
      fontSize: '12px', fontFamily: 'monospace', color: '#ffffff',
      wordWrap: { width: 750 },
    }).setScrollFactor(0).setDepth(3001);

    // Choices
    this.dialogChoiceTexts = [];
    const choicesY = 638;
    for (let i = 0; i < this.dialogChoices.length; i++) {
      const choice = this.dialogChoices[i];
      const ct = this.add.text(55 + i * 280, choicesY, choice.label, {
        fontSize: '11px', fontFamily: 'monospace', color: '#ffd700',
        backgroundColor: 'rgba(255,215,0,0.1)', padding: { x: 6, y: 3 },
      }).setScrollFactor(0).setDepth(3001);
      this.dialogChoiceTexts.push(ct);
    }
  }

  showSimpleDialog(title, text) {
    this.dialogActive = true;
    this.dialogNpcId = null;
    this.dialogChoices = [];
    this.closeDialog(true);

    this.dialogBox = this.add.rectangle(440, 620, 800, 80, 0x000000, 0.85)
      .setScrollFactor(0).setDepth(3000).setStrokeStyle(2, 0xffd700);
    this.dialogTitle = this.add.text(55, 590, title, {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffd700',
    }).setScrollFactor(0).setDepth(3001);
    this.dialogText = this.add.text(55, 612, text, {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffffff',
      wordWrap: { width: 750 },
    }).setScrollFactor(0).setDepth(3001);
  }

  closeDialog(internal) {
    if (this.dialogBox) { this.dialogBox.destroy(); this.dialogBox = null; }
    if (this.dialogTitle) { this.dialogTitle.destroy(); this.dialogTitle = null; }
    if (this.dialogText) { this.dialogText.destroy(); this.dialogText = null; }
    for (const ct of this.dialogChoiceTexts) ct.destroy();
    this.dialogChoiceTexts = [];
    if (!internal) {
      this.dialogActive = false;
      this.dialogChoices = [];
      this.dialogNpcId = null;
    }
  }

  handleDialogChoice(choiceIndex) {
    if (!this.dialogActive || choiceIndex >= this.dialogChoices.length) return;
    const choice = this.dialogChoices[choiceIndex];
    const npcId = this.dialogNpcId;
    const npcDef = npcId ? NPC_DEFS[npcId] : null;

    switch (choice.action) {
      case 'accept_quest':
        if (npcDef && npcDef.quest) {
          this.questManager.activate(npcDef.quest);
          this.showNotification(`📋 Новий квест: ${QUESTS[npcDef.quest].title}`);
        }
        this.closeDialog();
        break;

      case 'complete_step':
        if (npcDef && npcDef.quest) {
          const questId = npcDef.quest;
          // Remove delivered item from inventory
          const itemMap = { coffee_for_marina: 'coffee', lost_document: 'document', fix_printer: 'toolbox' };
          const itemId = itemMap[questId];
          if (itemId) this.inventory.remove(itemId);
          const completed = this.questManager.advanceStep(questId);
          if (completed) {
            this.showNotification(`✅ Квест виконано: ${QUESTS[questId].title}`);
          }
        }
        this.closeDialog();
        break;

      case 'decline':
      case 'close':
      default:
        this.closeDialog();
        break;
    }
  }

  // === ITEM PICKUP ===
  pickupItem(itemDef) {
    this.inventory.add(itemDef.id);
    // Advance quest step for item pickup
    for (const questId of this.questManager.getActiveQuests()) {
      if (this.questManager.currentStepNeedsItem(questId, itemDef.id)) {
        this.questManager.advanceStep(questId);
        break;
      }
    }
    this.showNotification(`🎒 Підібрано: ${ITEM_DEFS[itemDef.id]?.name || itemDef.name}`);
    this.refreshWorldItems();
  }

  // === NOTIFICATION ===
  showNotification(text) {
    this.notifText.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.notifText, alpha: 0, duration: 600, delay: 2200, ease: 'Power2',
    });
  }

  // === UI UPDATES ===
  updateQuestLog() {
    const lines = [];
    const active = this.questManager.getActiveQuests();
    const completed = this.questManager.getCompletedQuests();

    if (active.length === 0 && completed.length === 0) {
      lines.push('Поговори з колегами,');
      lines.push('щоб отримати квести!');
    }

    for (const qid of active) {
      const q = QUESTS[qid];
      const step = this.questManager.getCurrentStep(qid);
      lines.push(`▶ ${q.title}`);
      if (step) lines.push(`  → ${step.text}`);
    }
    for (const qid of completed) {
      lines.push(`✅ ${QUESTS[qid].title}`);
    }

    this.questLogText.setText(lines.join('\n'));

    // Resize background
    const h = Math.max(80, lines.length * 18 + 30);
    this.questLogBg.setSize(200, h).setPosition(1190, 40 + h / 2);
  }

  updateInventoryUI() {
    const items = this.inventory.getAll();
    if (items.length === 0) {
      this.inventoryText.setText('Інвентар порожній');
    } else {
      const names = items.map(id => ITEM_DEFS[id]?.name || id);
      this.inventoryText.setText(names.join('  │  '));
    }
  }

  // === GAME LOOP ===
  update() {
    // Dialog choice keys
    if (this.dialogActive && this.dialogChoices.length > 0) {
      if (Phaser.Input.Keyboard.JustDown(this.key1)) {
        this.handleDialogChoice(0);
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.key2) && this.dialogChoices.length > 1) {
        this.handleDialogChoice(1);
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(this.key3) && this.dialogChoices.length > 2) {
        this.handleDialogChoice(2);
        return;
      }
      // Allow closing with movement
      if (this.cursors.left.isDown || this.cursors.right.isDown ||
          this.cursors.up.isDown || this.cursors.down.isDown) {
        this.closeDialog();
      }
      return; // Block other input while dialog is active
    }

    // Close simple dialog on movement
    if (this.dialogActive && this.dialogChoices.length === 0) {
      if (this.cursors.left.isDown || this.cursors.right.isDown ||
          this.cursors.up.isDown || this.cursors.down.isDown) {
        this.closeDialog();
      }
    }

    // Movement (cancel mouse path on keyboard input)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.currentPath = null; this.pendingInteraction = null;
      this.movePlayer(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.currentPath = null; this.pendingInteraction = null;
      this.movePlayer(0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.currentPath = null; this.pendingInteraction = null;
      this.movePlayer(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.currentPath = null; this.pendingInteraction = null;
      this.movePlayer(1, 0);
    }

    // Interaction (SPACE)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.currentNpc) {
        this.showNpcDialog(this.currentNpc);
      } else if (this.currentItem) {
        this.pickupItem(this.currentItem);
      } else if (this.currentPoi) {
        this.showSimpleDialog(this.currentPoi.name, this.currentPoi.desc);
      }
    }

    // Hold-to-move
    if (!this.isMoving && !this.dialogActive) {
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

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
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
window.__GAME__ = game;
