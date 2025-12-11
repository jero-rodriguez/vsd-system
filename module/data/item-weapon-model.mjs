import VsDItemBaseModel from "./base-item-model.mjs";

const WEAPON_HANDS = Object.freeze(["1H", "2H", "1H/2H"]);
const WEAPON_LENGTH = Object.freeze([
  "shortest",
  "short",
  "medium",
  "long",
  "longest",
]);
const WEAPON_CRIT = Object.freeze(["cut", "impact", "pierce", "grapple"]);
const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDWeapon extends VsDItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.weapon = new fields.SchemaField({
      hands: new fields.StringField({
        initial: "1H",
        choices: WEAPON_HANDS,
      }),
      skill: new fields.StringField({
        initial: "blades", // blunt, blades, polearms, ranged, brawl...
        blank: false,
      }),
      clumsyRange: new fields.StringField({
        initial: "01-03",
        blank: false,
      }),
      length: new fields.StringField({
        initial: "short",
        choices: WEAPON_LENGTH,
      }),
      attackTable: new fields.StringField({
        initial: "",
        blank: false, // Short Edged, Two-Handed, Missile, etc.
      }),
      maxResult: new fields.NumberField({
        ...requiredInteger,
        initial: 150,
      }),
      primaryCrit: new fields.StringField({
        initial: "cut",
        choices: WEAPON_CRIT,
      }),
      secondaryCrit: new fields.StringField({
        initial: "",
        blank: true,
      }),
      baseRange: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      qualities: new fields.ArrayField(
        new fields.StringField({ initial: "", blank: true }),
        { initial: [] }
      ),
      cmbVsArmor: new fields.SchemaField({
        none: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        light: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        medium: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        heavy: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      }),
    });

    return schema;
  }

  static validateJoint(data) {
    super.validateJoint(data);
    if (!data?.weapon) return;

    const { hands } = data.weapon;
    if (hands && !WEAPON_HANDS.includes(hands)) {
      throw new Error("Weapon hands must be 1H, 2H or 1H/2H.");
    }
  }
}
