// Generate isometric tile sprites as canvas textures
// Larger tiles = crisp pixels

const TILE_W = 64;
const TILE_H = 32;

const COLORS = {
  floor_lounge:     { top: '#5a9c6b', side: '#4a8259' },   // green
  floor_kitchen:    { top: '#d4b85c', side: '#b89d4a' },    // yellow
  floor_workspace:  { top: '#8b6fbf', side: '#7359a6' },    // purple
  floor_corridor:   { top: '#9e9e9e', side: '#828282' },    // grey
  floor_stairs:     { top: '#b8683a', side: '#9e5530' },    // brown
  floor_toilet:     { top: '#f0f0f0', side: '#d6d6d6' },    // white
  floor_understairs:{ top: '#e07f98', side: '#c46a82' },    // pink
  floor_balcony:    { top: '#7aab82', side: '#638b6a' },    // sage green
  wall:             { top: '#4a4a6e', side: '#363652' },    // dark blue-grey
};

export function generateTileTextures(scene) {
  for (const [name, colors] of Object.entries(COLORS)) {
    const isWall = name === 'wall';
    const wallH = isWall ? 12 : 0;
    const canvas = document.createElement('canvas');
    canvas.width = TILE_W;
    canvas.height = TILE_H + wallH;
    const ctx = canvas.getContext('2d');

    // Top face (diamond)
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.moveTo(TILE_W / 2, 0);
    ctx.lineTo(TILE_W, TILE_H / 2);
    ctx.lineTo(TILE_W / 2, TILE_H);
    ctx.lineTo(0, TILE_H / 2);
    ctx.closePath();
    ctx.fill();

    // Subtle edge (not a grid line)
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Wall side faces
    if (isWall) {
      // Left face
      ctx.fillStyle = colors.side;
      ctx.beginPath();
      ctx.moveTo(0, TILE_H / 2);
      ctx.lineTo(TILE_W / 2, TILE_H);
      ctx.lineTo(TILE_W / 2, TILE_H + wallH);
      ctx.lineTo(0, TILE_H / 2 + wallH);
      ctx.closePath();
      ctx.fill();

      // Right face (slightly lighter)
      ctx.fillStyle = '#3d3d56';
      ctx.beginPath();
      ctx.moveTo(TILE_W, TILE_H / 2);
      ctx.lineTo(TILE_W / 2, TILE_H);
      ctx.lineTo(TILE_W / 2, TILE_H + wallH);
      ctx.lineTo(TILE_W, TILE_H / 2 + wallH);
      ctx.closePath();
      ctx.fill();
    }

    scene.textures.addCanvas(name, canvas);
  }

  generateCharSprite(scene, 'character', '#e74c3c', '#2c3e50');
}

/**
 * Generate a character sprite with custom body/hair colors.
 * Re-used for player and all NPCs.
 */
export function generateCharSprite(scene, textureName, bodyColor, hairColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 36;
  const ctx = canvas.getContext('2d');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(12, 33, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(7, 14, 10, 14);

  // Head
  ctx.fillStyle = '#ffd5b4';
  ctx.fillRect(8, 5, 8, 9);

  // Hair
  ctx.fillStyle = hairColor;
  ctx.fillRect(8, 3, 8, 4);

  // Eyes
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(9, 9, 2, 2);
  ctx.fillRect(13, 9, 2, 2);

  // Legs
  ctx.fillStyle = '#34495e';
  ctx.fillRect(8, 28, 3, 5);
  ctx.fillRect(13, 28, 3, 5);

  scene.textures.addCanvas(textureName, canvas);
}

/**
 * Generate item pickup sprites (small glowing icons on the ground)
 */
export function generateItemSprites(scene) {
  // Coffee cup
  _makeItemSprite(scene, 'item_coffee', (ctx) => {
    // Cup body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(5, 6, 10, 10);
    // Cup handle
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 11, 3, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    // Steam
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 5); ctx.quadraticCurveTo(7, 2, 9, 0);
    ctx.moveTo(12, 5); ctx.quadraticCurveTo(11, 2, 13, 0);
    ctx.stroke();
  });

  // Document
  _makeItemSprite(scene, 'item_document', (ctx) => {
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(4, 2, 12, 16);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 2, 12, 16);
    // Text lines
    ctx.fillStyle = '#666';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(6, 5 + i * 3, 8, 1);
    }
  });

  // Toolbox
  _makeItemSprite(scene, 'item_toolbox', (ctx) => {
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(3, 6, 14, 10);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(3, 6, 14, 3);
    // Handle
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(8, 3, 4, 4);
    // Latch
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(9, 10, 2, 2);
  });
}

function _makeItemSprite(scene, name, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = 20;
  canvas.height = 20;
  const ctx = canvas.getContext('2d');
  drawFn(ctx);
  scene.textures.addCanvas(name, canvas);
}

export { TILE_W, TILE_H, COLORS };
