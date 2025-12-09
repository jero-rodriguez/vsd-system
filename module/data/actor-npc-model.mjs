import VsDActorBase from "./base-actor-model.mjs";

export default class VsDNpcData extends VsDActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };

    const schema = super.defineSchema();

    // Por ejemplo, solo un par de stats agregados
    schema.basic = new fields.SchemaField({
      level: new fields.NumberField({
        ...requiredInteger,
        initial: 1,
        min: 1,
      }),
      offense: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      defense: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    // Si quieres, puedes añadir una lista de ataques, etc.
    // schema.attacks = ...

    return schema;
  }
}
