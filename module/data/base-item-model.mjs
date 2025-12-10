import VsDDataModel from "./base-model.mjs";

const ITEM_QUALITY = Object.freeze(["low", "normal", "superior", "masterwork"]);

export default class VsDItemBase extends VsDDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    // Descripción corta o larga, como prefieras
    schema.description = new fields.HTMLField({
      initial: "",
      nullable: true,
    });

    // Tags genéricas tipo ["weapon", "two-handed", "orcish"]
    schema.tags = new fields.ArrayField(
      new fields.StringField({ initial: "", blank: true }),
      { initial: [] }
    );

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
