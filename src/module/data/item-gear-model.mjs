import VsDItemEquipableModel from "./item-equipable-model.mjs";

const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDGear extends VsDItemEquipableModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 1,
    });

    schema.weight = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
      min: 0,
    });

    // Si quieres, conservar un campo "value" para TV1–TV5 o monedas
    schema.value = new fields.StringField({
      initial: "",
      blank: true,
    });

    return schema;
  }
}
