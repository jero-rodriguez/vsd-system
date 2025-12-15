import VsDItemBaseModel from "./base-item-model.mjs";

const fields = foundry.data.fields;
const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDCultureModel extends VsDItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Rango cultural por Skill (skillCode -> ranks)
    schema.culturalSkillRanks = new fields.SchemaField(
      {
        // Ejemplo: lo dejas vacío, lo rellenas vía sheet/JSON:
        // acrobatics: new fields.NumberField({ ...requiredInteger, initial: 0 })
        // Perfiles concretos se pueden añadir según definas el sistema de Skills.
      },
      { required: false }
    );

    // Ranks culturales de Spell Lores
    schema.culturalSpellLores = new fields.SchemaField(
      {
        // p.ej. detections: new fields.NumberField({ ...requiredInteger, initial: 0 })
      },
      { required: false }
    );

    // Opciones de equipo inicial (texto libre o códigos de items)
    schema.outfitting = new fields.SchemaField(
      {
        firstOption: new fields.ArrayField(
          new fields.StringField({ initial: "", required: false, blank: true }),
          { required: false }
        ),
        secondOption: new fields.ArrayField(
          new fields.StringField({ initial: "", required: false, blank: true }),
          { required: false }
        ),
        thirdOption: new fields.ArrayField(
          new fields.StringField({ initial: "", required: false, blank: true }),
          { required: false }
        ),
      },
      { required: false }
    );

    // Wealth inicial de la Cultura
    schema.startingWealthLevel = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });

    // Texto de worldview/pasiones (ya tienes description en la base)
    return schema;
  }
}
