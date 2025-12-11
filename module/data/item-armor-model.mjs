import VsDItemBaseModel from "./base-item-model.mjs";

const ARMOR_TYPE = Object.freeze(["NA", "LA", "ME", "HE"]);
const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDArmor extends VsDItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.armor = new fields.SchemaField({
      armorType: new fields.StringField({
        initial: "NA",
        choices: ARMOR_TYPE,
      }),
      zones: new fields.ArrayField(
        new fields.StringField({ initial: "", blank: true }),
        { initial: [] } // "torso", "arms", "legs", "head", etc.
      ),
      maxSwiftnessToDef: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      movePenalty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      cmbPenalty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      perceptionPenalty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      meleeBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      rangedBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      isShield: new fields.BooleanField({
        initial: false,
      }),
    });

    return schema;
  }
}
