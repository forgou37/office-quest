// NPC System — characters, positioning, and dialog trees

export const NPC_DEFS = {
  marina: {
    id: 'marina',
    name: 'Марина',
    gridX: 12,
    gridY: 8,
    color: '#3498db', // blue
    hairColor: '#8e44ad',
    quest: 'coffee_for_marina',
    dialogs: {
      not_started: {
        text: 'Привіт! Я так хочу кави, але не можу відійти від роботи... Можеш принести?',
        choices: [
          { key: '1', label: '1. Звісно, зараз принесу!', action: 'accept_quest' },
          { key: '2', label: '2. Може пізніше', action: 'decline' },
        ],
      },
      active_step0: {
        text: 'Каву можна взяти на кухні, біля кавоварки! ☕',
        choices: [
          { key: '1', label: '1. Вже йду!', action: 'close' },
        ],
      },
      active_step1: {
        text: 'О, ти приніс каву! Дякую величезне! 🎉',
        choices: [
          { key: '1', label: '1. Будь ласка!', action: 'complete_step' },
        ],
      },
      completed: {
        text: 'Кава була чудова, дякую ще раз! ☕❤️',
        choices: [
          { key: '1', label: '1. Нема за що!', action: 'close' },
        ],
      },
    },
  },
  taras: {
    id: 'taras',
    name: 'Тарас',
    gridX: 8,
    gridY: 30,
    color: '#27ae60', // green
    hairColor: '#d35400',
    quest: 'lost_document',
    dialogs: {
      not_started: {
        text: 'Йой, я загубив звіт Q4 десь тут в опенспейсі... Допоможеш знайти?',
        choices: [
          { key: '1', label: '1. Допоможу, пошукаю!', action: 'accept_quest' },
          { key: '2', label: '2. Зараз зайнятий', action: 'decline' },
        ],
      },
      active_step0: {
        text: 'Документ мав бути десь біля робочих столів у опенспейсі...',
        choices: [
          { key: '1', label: '1. Ок, пошукаю', action: 'close' },
        ],
      },
      active_step1: {
        text: 'Ти знайшов документ?! Врятував мене! 📄🙏',
        choices: [
          { key: '1', label: '1. Тримай!', action: 'complete_step' },
        ],
      },
      completed: {
        text: 'Дякую за документ! Тепер дедлайн не страшний 💪',
        choices: [
          { key: '1', label: '1. Удачі!', action: 'close' },
        ],
      },
    },
  },
  olena: {
    id: 'olena',
    name: 'Олена',
    gridX: 20,
    gridY: 23,
    color: '#e67e22', // orange
    hairColor: '#2c3e50',
    quest: 'fix_printer',
    dialogs: {
      not_started: {
        text: 'Принтер знову зламався! Потрібен набір інструментів, він десь на балконі.',
        choices: [
          { key: '1', label: '1. Зараз пошукаю!', action: 'accept_quest' },
          { key: '2', label: '2. Не зараз', action: 'decline' },
        ],
      },
      active_step0: {
        text: 'Інструменти мали бути на балконі, де ми зазвичай обідаємо.',
        choices: [
          { key: '1', label: '1. Зрозуміло!', action: 'close' },
        ],
      },
      active_step1: {
        text: 'О, інструменти! Зараз полагоджу принтер. Дякую! 🔧',
        choices: [
          { key: '1', label: '1. Без проблем!', action: 'complete_step' },
        ],
      },
      completed: {
        text: 'Принтер працює як новий! Ти справжній герой офісу 🦸',
        choices: [
          { key: '1', label: '1. Завжди радий допомогти!', action: 'close' },
        ],
      },
    },
  },
  denis: {
    id: 'denis',
    name: 'Денис',
    gridX: 23,
    gridY: 7,
    color: '#9b59b6', // purple
    hairColor: '#1abc9c',
    quest: null, // ambient NPC, no quest
    dialogs: {
      default: {
        text: 'Хочеш чаю? На кухні є новий улун, рекомендую! 🍵',
        choices: [
          { key: '1', label: '1. Дякую за пораду!', action: 'close' },
          { key: '2', label: '2. Я більше по каві', action: 'close' },
        ],
      },
    },
  },
};

/**
 * Get dialog for NPC based on quest state
 */
export function getNpcDialog(npcDef, questManager, inventory) {
  if (!npcDef.quest) {
    return npcDef.dialogs.default;
  }

  const questId = npcDef.quest;
  const state = questManager.getState(questId);

  if (state === 'completed') {
    return npcDef.dialogs.completed;
  }

  if (state === 'not_started') {
    return npcDef.dialogs.not_started;
  }

  // Active — check which step
  const stepIdx = questManager.stepIndex[questId];
  const step = questManager.getCurrentStep(questId);

  // If this step requires delivering to this NPC and player has the item
  if (step && step.npc === npcDef.id) {
    // Check if we need an item from a previous step
    const quest = questManager.constructor ? null : null;
    // For delivery steps, check inventory for the quest's pickup item
    const questDef = questManager._getQuestDef ? null : null;
    // Simplified: check the previous step's item
    const prevStepIdx = stepIdx - 1;
    const questData = { coffee_for_marina: 'coffee', lost_document: 'document', fix_printer: 'toolbox' };
    const neededItem = questData[questId];
    if (neededItem && inventory.has(neededItem)) {
      return npcDef.dialogs[`active_step${stepIdx}`];
    }
    // Player doesn't have the item yet
    return npcDef.dialogs.active_step0 || npcDef.dialogs.not_started;
  }

  return npcDef.dialogs[`active_step${stepIdx}`] || npcDef.dialogs.not_started;
}
