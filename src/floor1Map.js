// Floor 1 — v9 by Igor

const W = 'W', L = 'L', K = 'K', P = 'P', O = 'O', C = 'C', T = 'T', S = 'S', B = 'B', _ = '.';

export const FLOOR1_MAP = [
  // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
  [ _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_ ], // 0
  [ _,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_ ], // 1
  [ _,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_ ], // 2
  [ _,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_ ], // 3
  [ _,B,B,B,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,_,_,_ ], // 4
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 5
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 6
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 7
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 8
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 9
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,W,_,_,_ ], // 10
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,W,_,_,_ ], // 11
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,W,_,_,_ ], // 12
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 13
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 14
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 15
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,K,K,K,K,K,K,W,_,_,_ ], // 16
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,W,_,_,_ ], // 17
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,W,_,_,_ ], // 18
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,W,W,W,W,W,W,_,_,_ ], // 19
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,C,C,C,C,C,C,C,C,W,_,_,_ ], // 20
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,C,C,C,C,C,C,C,C,W,_,_,_ ], // 21
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,C,C,C,C,C,C,C,C,W,_,_,_ ], // 22
  [ _,B,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,C,C,C,C,C,C,C,C,W,_,_,_ ], // 23
  [ _,B,B,B,W,W,W,W,W,W,W,W,W,W,W,W,C,C,C,C,C,C,C,C,C,C,C,W,_,_,_ ], // 24
  [ _,W,W,W,W,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,C,C,C,C,C,C,W,_,_,_ ], // 25
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,C,C,C,C,C,W,_,_,_ ], // 26
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,C,C,C,C,C,W,W,W,W,W,W,_,_,_ ], // 27
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,C,C,C,C,C,W,T,T,T,T,W,_,_,_ ], // 28
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,W,T,T,T,T,W,_,_,_ ], // 29
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,T,T,T,T,T,W,_,_,_ ], // 30
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,T,T,T,T,T,W,_,_,_ ], // 31
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,W,T,T,T,T,W,_,_,_ ], // 32
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,W,W,W,W,W,W,_,_,_ ], // 33
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,W,_,_,_,_,_,_,_,_ ], // 34
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,C,_,_,_,_,_,_,_,_ ], // 35
  [ _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,C,_,_,_,_,_,_,_,_ ], // 36
  [ _,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,_,_,_,_,_,_,_,_ ], // 37
  [ _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_ ], // 38
];

export const TILE_TEXTURES = {
  '.': null, 'W': 'wall', 'L': 'floor_lounge', 'K': 'floor_kitchen',
  'P': 'floor_understairs', 'O': 'floor_workspace', 'C': 'floor_corridor',
  'T': 'floor_toilet', 'S': 'floor_stairs', 'B': 'floor_balcony',
};

export const WALKABLE = new Set(['L', 'K', 'P', 'O', 'C', 'T', 'S', 'B']);

export const ROOM_LABELS = {
  'L': 'Зона відпочинку', 'K': 'Кухня', 'P': 'Під сходами',
  'O': 'Робочий опенспейс', 'C': 'Коридор', 'T': 'Туалет',
  'S': 'Сходи', 'B': 'Балкон',
};

export const POI = [
  { x: 12, y: 10, name: 'Бінбеги', desc: 'Тут можна розслабитись після важкого дня 🛋️' },
  { x: 7, y: 6, name: 'Постер WE NEED YOU', desc: 'Космонавт дивиться прямо на тебе 🚀' },
  { x: 16, y: 15, name: 'Неонова підсвітка', desc: 'Фіолетовий неон створює вайб 🟣' },
  { x: 24, y: 9, name: 'Кавоварка', desc: 'Espresso, Americano, чи Flat White? ☕' },
  { x: 20, y: 35, name: 'Вихід на вулицю', desc: 'Двері назовні 🚪' },
  { x: 25, y: 30, name: 'Туалет', desc: 'Без коментарів 🚽' },
  { x: 9, y: 30, name: 'Робочий стіл', desc: 'Три монітори і механічна клавіатура ⌨️' },
  { x: 24, y: 22, name: 'Коридор', desc: 'Тут завжди хтось ходить ☕' },
];
