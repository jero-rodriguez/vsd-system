import VsDItemBaseModel from "./base-item-model.mjs";

const SALVATION_ROLL = Object.freeze(["", "TSR", "WSR"]);
const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDSpell extends VsDItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.spell = new fields.SchemaField({
      weave: new fields.NumberField({
        ...requiredInteger,
        initial: 1,
        min: 1,
        max: 10,
      }),
      range: new fields.StringField({
        initial: "Self",
        blank: false,
      }),
      areaOfEffect: new fields.StringField({
        initial: "1 target",
        blank: false,
      }),
      duration: new fields.StringField({
        initial: "-",
        blank: false,
      }),
      mpCost: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      castingTime: new fields.StringField({
        initial: "Half Action",
        blank: false,
      }),
      saveType: new fields.StringField({
        initial: "",
        choices: SALVATION_ROLL,
      }),
      effect: new fields.HTMLField({
        initial: "",
        nullable: true,
      }),
    });

    return schema;
  }
}
