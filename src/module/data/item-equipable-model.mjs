import VsDItemBaseModel from "./base-item-model.mjs";

const ITEM_QUALITY = Object.freeze(["low", "normal", "superior", "masterwork"]);

export default class VsDItemEquipableModel extends VsDItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    // Calidad del objeto (afecta a CMB, DEF, etc.)
    schema.quality = new fields.StringField({
      initial: "normal",
      choices: ITEM_QUALITY,
    });

    // Propiedades mágicas genéricas (Bonus Items, maldiciones, etc.)
    schema.magic = new fields.SchemaField({
      isMagical: new fields.BooleanField({ initial: false }),
      isCursed: new fields.BooleanField({ initial: false }),
      itemModifier: new fields.NumberField({
        required: false,
        nullable: true,
        integer: true,
        initial: 0,
      }),
      modifierTarget: new fields.StringField({
        initial: "",
        blank: true, // "stat:brn", "skill:blades", "save:tsr", etc.
      }),
    });

    return schema;
  }
}
