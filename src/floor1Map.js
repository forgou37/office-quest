// Floor 1 — v7 fixes: door to green, wider entrance, no wall between corridor/stairs

const W = 'W', L = 'L', K = 'K', P = 'P', O = 'O', C = 'C', T = 'T', S = 'S', B = 'B', _ = '.';

export const FLOOR1_MAP = [
  //  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
  [  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_  ], // 0
  [  _,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_  ], // 1
  [  _,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,_,_,_  ], // 2
  [  _,B,B,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,_,_,_  ], // 3
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 4
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 5
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 6
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 7
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 8
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 9
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 10
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,K,K,K,K,K,K,W,_,_,_  ], // 11
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,W,W,W,W,W,W,W,_,_,_  ], // 12
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,W,P,P,P,P,P,P,W,_,_,_  ], // 13
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,C,P,P,P,P,P,P,W,_,_,_  ], // 14  ← door green→corridor
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,C,P,P,P,P,P,P,W,_,_,_  ], // 15  ← door green→corridor
  [  _,B,B,W,L,L,L,L,L,L,L,L,L,L,L,L,L,L,C,C,C,C,C,C,C,W,_,_,_  ], // 16  ← corridor opens wide
  [  _,_,_,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,C,C,C,C,C,C,C,W,_,_,_  ], // 17  shared wall, corridor continues
  [  _,W,W,W,O,O,O,O,O,O,O,O,O,O,O,O,C,C,C,C,S,S,S,S,S,W,_,_,_  ], // 18  ← open corridor+stairs
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,C,C,C,C,S,S,S,S,S,W,_,_,_  ], // 19
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,C,C,C,C,S,S,S,S,S,W,_,_,_  ], // 20
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,C,C,C,C,S,S,S,S,S,W,_,_,_  ], // 21
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,C,C,C,C,W,_,_,_  ], // 22  ← no wall, open corridor
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,T,T,T,T,W,_,_,_  ], // 23
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,T,T,T,T,W,_,_,_  ], // 24
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,T,T,T,T,W,_,_,_  ], // 25
  [  _,W,O,O,O,O,O,O,O,O,O,O,O,O,O,O,W,C,C,C,C,W,W,W,W,W,_,_,_  ], // 26
  [  _,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,C,C,C,C,C,C,C,C,W,_,_,_  ], // 27  entrance — wide
  [  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W,W,C,C,C,W,W,W,W,_,_,_  ], // 28  entrance door
  [  _,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_  ], // 29
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
  { x: 10, y: 8, name: 'Бінбеги', desc: 'Тут можна розслабитись після важкого дня 🛋️' },
  { x: 6, y: 5, name: 'Постер WE NEED YOU', desc: 'Космонавт дивиться прямо на тебе 🚀' },
  { x: 14, y: 13, name: 'Неонова підсвітка', desc: 'Фіолетовий неон створює вайб 🟣' },
  { x: 22, y: 7, name: 'Кавоварка', desc: 'Espresso, Americano, чи Flat White? ☕' },
  { x: 22, y: 20, name: 'Сходи нагору', desc: '↑ На 2-й поверх' },
  { x: 22, y: 24, name: 'Туалет', desc: 'Без коментарів 🚽' },
  { x: 8, y: 23, name: 'Робочий стіл', desc: 'Три монітори і механічна клавіатура ⌨️' },
  { x: 22, y: 14, name: 'Під сходами', desc: 'Таємний куточок 🔮' },
  { x: 20, y: 28, name: 'Вхід', desc: 'Двері на вулицю 🚪' },
];
