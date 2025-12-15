/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class VsDItem extends Item {
  prepareBaseData() {
    super.prepareBaseData();

    if (this.type !== "kin") return;

    const system = this.system;

    // Compatibilidad: arrays antiguos → texto
    if (Array.isArray(system.specialTraits)) {
      system.specialTraits = system.specialTraits
        .filter((t) => t && t.trim())
        .join("\n");
    }

    if (Array.isArray(system.suggestedCultures)) {
      system.suggestedCultures = system.suggestedCultures
        .filter((c) => c && c.trim())
        .join("\n");
    }
  }

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    const rollData = { ...this.system };

    if (!this.actor) return rollData;

    rollData.actor = this.actor.getRollData();
    return rollData;
  }

  /**
   * Convert the actor document to a plain object.
   */
  toPlainObject() {
    const system = this.system;

    if (system && typeof system.toPlainObject === "function") {
      return system.toPlainObject();
    }

    return this.toObject(false);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${item.type}] ${item.name}`;

    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? "",
      });
    } else {
      const rollData = this.getRollData();
      const roll = new Roll(rollData.formula, rollData.actor);
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
