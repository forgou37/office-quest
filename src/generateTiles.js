// Generate isometric tile sprites as canvas textures at runtime
// Each tile is a diamond shape (isometric projection)

const TILE_W = 32;
const TILE_H = 16;

const COLORS = {
  floor_lounge:   { top: '#4a7c59', side: '#3a6249' },   // green - lounge
  floor_kitchen:  { top: '#c9a84c', side: '#a8893d' },   // yellow - kitchen
  floor_workspace:{ top: '#7b5ea7', side: '#634b87' },   // purple - workspace
  floor_corridor: { top: '#8c8c8c', side: '#6e6e6e' },   // grey - corridor
  floor_stairs:   { top: '#a0522d', side: '#8b4513' },   // brown - stairs
  floor_toilet:   { top: '#e8e8e8', side: '#cccccc' },   // white - toilet
  floor_understairs:{ top: '#d4738a', side: '#b85c73' }, // pink - under stairs
  floor_balcony:  { top: '#6b8f71', side: '#567360' },   // dark green - balcony
  wall:           { top: '#3d3d5c', side: '#2d2d44' },   // dark wall
  wall_ext:       { top: '#555577', side: '#444466' },   // external wall
};

export function generateTileTextures(scene) {
  for (const [name, colors] of Object.entries(COLORS)) {
    const canvas = document.createElement('canvas');
    canvas.width = TILE_W;
    canvas.height = TILE_H + 8; // extra height for side face
    const ctx = canvas.getContext('2d');

    // Top face (diamond)
    ctx.fillStyle = colors.top;
    ctx.beginPath();
    ctx.moveTo(TILE_W / 2, 0);          // top
    ctx.lineTo(TILE_W, TILE_H / 2);     // right
    ctx.lineTo(TILE_W / 2, TILE_H);     // bottom
    ctx.lineTo(0, TILE_H / 2);          // left
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Side face (left)
    if (name.startsWith('wall')) {
      const wallH = 8;
      ctx.fillStyle = colors.side;
      ctx.beginPath();
      ctx.moveTo(0, TILE_H / 2);
      ctx.lineTo(TILE_W / 2, TILE_H);
      ctx.lineTo(TILE_W / 2, TILE_H + wallH);
      ctx.lineTo(0, TILE_H / 2 + wallH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Side face (right)
      ctx.fillStyle = colors.side;
      ctx.beginPath();
      ctx.moveTo(TILE_W, TILE_H / 2);
      ctx.lineTo(TILE_W / 2, TILE_H);
      ctx.lineTo(TILE_W / 2, TILE_H + wallH);
      ctx.lineTo(TILE_W, TILE_H / 2 + wallH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    scene.textures.addCanvas(name, canvas);
  }

  // Generate character sprite
  generateCharSprite(scene);
}

function generateCharSprite(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 24;
  const ctx = canvas.getContext('2d');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(8, 22, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(5, 10, 6, 9);

  // Head
  ctx.fillStyle = '#ffd5b4';
  ctx.fillRect(5, 4, 6, 6);

  // Hair
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(5, 3, 6, 3);

  // Eyes
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(6, 7, 1, 1);
  ctx.fillRect(9, 7, 1, 1);

  // Legs
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(5, 19, 2, 3);
  ctx.fillRect(9, 19, 2, 3);

  scene.textures.addCanvas('character', canvas);
}

export { TILE_W, TILE_H, COLORS };
