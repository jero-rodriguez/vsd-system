import VsDDataModel from "./base-model.mjs";

export default class VsDActorBaseModel extends VsDDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.hitPoints = new fields.SchemaField({
      current: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
        min: 0,
      }),
      max: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
        min: 0,
      }),
    });

    schema.biography = new fields.StringField({
      initial: "",
      blank: true,
    });

    return schema;
  }

  static validateJoint(data) {
    super.validateJoint(data);
    const hp = data.hitPoints;
    if (!hp) return;
    if (hp.current < 0 || hp.current > hp.max) {
      throw new Error("Hit Points current must be between 0 and max.");
    }
  }
}
