import VsDDataModel from "./base-model.mjs";

export default class VsDItemBaseModel extends VsDDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    // Campo de código interno opcional (para vincular con el manual u hojas)
    schema.code = new fields.StringField({
      initial: "",
      required: false,
      blank: true,
    });

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

    return schema;
  }
}
