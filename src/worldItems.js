// World Items — pickable items that appear/disappear based on quest state

export const WORLD_ITEMS = {
  coffee: {
    id: 'coffee',
    name: 'Кава ☕',
    gridX: 24,
    gridY: 8,
    visibleWhen: (questManager) => {
      return questManager.getState('coffee_for_marina') === 'active'
        && questManager.stepIndex['coffee_for_marina'] === 0;
    },
  },
  document: {
    id: 'document',
    name: 'Документ 📄',
    gridX: 13,
    gridY: 32,
    visibleWhen: (questManager) => {
      return questManager.getState('lost_document') === 'active'
        && questManager.stepIndex['lost_document'] === 0;
    },
  },
  toolbox: {
    id: 'toolbox',
    name: 'Інструменти 🔧',
    gridX: 2,
    gridY: 2,
    visibleWhen: (questManager) => {
      return questManager.getState('fix_printer') === 'active'
        && questManager.stepIndex['fix_printer'] === 0;
    },
  },
};
