import VsDItemBaseModel from "./base-item-model.mjs";

const LORE_CATEGORY = Object.freeze(["common", "vocational", "kin"]);
const LORE_STAT_ASSOCIATED = Object.freeze([
  "brawn",
  "swiftness",
  "fortitude",
  "wits",
  "wisdom",
  "bearing",
]);

export default class VsDSpellLore extends VsDItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.lore = new fields.SchemaField({
      category: new fields.StringField({
        initial: "common",
        choices: LORE_CATEGORY,
      }),
      associatedStat: new fields.StringField({
        initial: "wits",
        choices: LORE_STAT_ASSOCIATED,
      }),
      // IDs de spells por weave
      weaves: new fields.SchemaField({
        w1: new fields.StringField({ initial: "", blank: true }),
        w2: new fields.StringField({ initial: "", blank: true }),
        w3: new fields.StringField({ initial: "", blank: true }),
        w4: new fields.StringField({ initial: "", blank: true }),
        w5: new fields.StringField({ initial: "", blank: true }),
        w6: new fields.StringField({ initial: "", blank: true }),
        w7: new fields.StringField({ initial: "", blank: true }),
        w8: new fields.StringField({ initial: "", blank: true }),
        w9: new fields.StringField({ initial: "", blank: true }),
        w10: new fields.StringField({ initial: "", blank: true }),
      }),
    });

    return schema;
  }

  static validateJoint(data) {
    super.validateJoint(data);
    if (!data?.lore?.weaves) return;

    const ids = Object.values(data.lore.weaves).filter(Boolean);
    const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (dupes.length) {
      throw new Error("Duplicated spell IDs in spell lore weaves.");
    }
  }
}
