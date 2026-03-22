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

  generateCharSprite(scene);
}

function generateCharSprite(scene) {
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
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(7, 14, 10, 14);

  // Head
  ctx.fillStyle = '#ffd5b4';
  ctx.fillRect(8, 5, 8, 9);

  // Hair
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(8, 3, 8, 4);

  // Eyes
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(9, 9, 2, 2);
  ctx.fillRect(13, 9, 2, 2);

  // Legs
  ctx.fillStyle = '#34495e';
  ctx.fillRect(8, 28, 3, 5);
  ctx.fillRect(13, 28, 3, 5);

  scene.textures.addCanvas('character', canvas);
}

export { TILE_W, TILE_H, COLORS };
