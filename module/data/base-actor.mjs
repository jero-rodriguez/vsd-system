import VsDDataModel from "./base-model.mjs";

export default class VsDActorBase extends VsDDataModel {
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

    //Old ATtributes from base actor
    schema.health = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: 10,
        min: 0,
      }),
      max: new fields.NumberField({ ...requiredInteger, initial: 10 }),
    });
    schema.power = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 5 }),
    });
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    return schema;
  }

  static validateJoint(data) {
    // Joint validation for base actor fields
    super.validateJoint(data);

    const hp = data.hitPoints;
    if (hp) {
      if (hp.current < 0 || hp.current > hp.max) {
        throw new Error("Hit Points current must be between 0 and max.");
      }
    }
  }
}
