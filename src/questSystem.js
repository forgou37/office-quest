// Quest System — manages quest states and progression

export const QuestState = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

// Quest definitions
export const QUESTS = {
  coffee_for_marina: {
    id: 'coffee_for_marina',
    title: 'Кава для Марини',
    description: 'Марина хоче каву. Візьми каву на кухні та принеси їй.',
    steps: [
      { id: 'get_coffee', text: 'Візьми каву на кухні', item: 'coffee' },
      { id: 'deliver_coffee', text: 'Віднеси каву Марині', npc: 'marina' },
    ],
  },
  lost_document: {
    id: 'lost_document',
    title: 'Загублений документ',
    description: 'Тарас загубив важливий документ десь в опенспейсі.',
    steps: [
      { id: 'find_doc', text: 'Знайди документ в опенспейсі', item: 'document' },
      { id: 'return_doc', text: 'Віднеси документ Тарасу', npc: 'taras' },
    ],
  },
  fix_printer: {
    id: 'fix_printer',
    title: 'Ремонт принтера',
    description: 'Олена просить полагодити принтер. Спочатку знайди інструменти.',
    steps: [
      { id: 'find_tools', text: 'Знайди набір інструментів на балконі', item: 'toolbox' },
      { id: 'fix_it', text: 'Поверни інструменти Олені', npc: 'olena' },
    ],
  },
};

export class QuestManager {
  constructor() {
    // state per quest
    this.states = {};
    // current step index per quest
    this.stepIndex = {};
    for (const id of Object.keys(QUESTS)) {
      this.states[id] = QuestState.NOT_STARTED;
      this.stepIndex[id] = 0;
    }
    this.onChangeCallbacks = [];
  }

  onChange(cb) {
    this.onChangeCallbacks.push(cb);
  }

  _notify() {
    for (const cb of this.onChangeCallbacks) cb();
  }

  getState(questId) {
    return this.states[questId];
  }

  getCurrentStep(questId) {
    const quest = QUESTS[questId];
    if (!quest) return null;
    const idx = this.stepIndex[questId];
    return quest.steps[idx] || null;
  }

  activate(questId) {
    if (this.states[questId] === QuestState.NOT_STARTED) {
      this.states[questId] = QuestState.ACTIVE;
      this.stepIndex[questId] = 0;
      this._notify();
      return true;
    }
    return false;
  }

  /** Advance to next step. Returns true if quest completed. */
  advanceStep(questId) {
    if (this.states[questId] !== QuestState.ACTIVE) return false;
    const quest = QUESTS[questId];
    this.stepIndex[questId]++;
    if (this.stepIndex[questId] >= quest.steps.length) {
      this.states[questId] = QuestState.COMPLETED;
      this._notify();
      return true; // completed
    }
    this._notify();
    return false;
  }

  /** Check if current step requires picking up a specific item */
  currentStepNeedsItem(questId, itemId) {
    const step = this.getCurrentStep(questId);
    return step && step.item === itemId && this.states[questId] === QuestState.ACTIVE;
  }

  /** Check if current step requires talking to a specific NPC */
  currentStepNeedsNpc(questId, npcId) {
    const step = this.getCurrentStep(questId);
    return step && step.npc === npcId && this.states[questId] === QuestState.ACTIVE;
  }

  getActiveQuests() {
    return Object.keys(QUESTS).filter(id => this.states[id] === QuestState.ACTIVE);
  }

  getCompletedQuests() {
    return Object.keys(QUESTS).filter(id => this.states[id] === QuestState.COMPLETED);
  }
}
