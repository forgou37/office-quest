// Inventory System — pick up, store, and use items

export const ITEM_DEFS = {
  coffee: { name: 'Кава ☕', desc: 'Гаряча кава для колеги' },
  document: { name: 'Документ 📄', desc: 'Важливий звіт Q4' },
  toolbox: { name: 'Інструменти 🔧', desc: 'Набір для ремонту' },
};

export class Inventory {
  constructor() {
    this.items = []; // array of item ids
    this.onChangeCallbacks = [];
  }

  onChange(cb) {
    this.onChangeCallbacks.push(cb);
  }

  _notify() {
    for (const cb of this.onChangeCallbacks) cb();
  }

  add(itemId) {
    if (!this.items.includes(itemId)) {
      this.items.push(itemId);
      this._notify();
      return true;
    }
    return false;
  }

  remove(itemId) {
    const idx = this.items.indexOf(itemId);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this._notify();
      return true;
    }
    return false;
  }

  has(itemId) {
    return this.items.includes(itemId);
  }

  getAll() {
    return [...this.items];
  }
}
