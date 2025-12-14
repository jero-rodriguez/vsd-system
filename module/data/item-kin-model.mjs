import VsDItemBaseModel from "./base-item-model.mjs";

const fields = foundry.data.fields;
const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDKinModel extends VsDItemBaseModel {
  static defineSchema() {
    const schema = super.defineSchema();

    // Modificadores a Stats (tabla de Kin Modifiers)
    schema.stats = new fields.SchemaField({
      brn: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      swi: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      for: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      wit: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      wsd: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      bea: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    // Modificadores de recursos
    schema.resources = new fields.SchemaField({
      hitPoints: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      maxHitPoints: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      magicPoints: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      tsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      wsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      backgroundPoints: new fields.NumberField({
        ...requiredInteger,
        initial: 4,
      }),
      wealthLevelBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    schema.initialWealthLevel = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });

    // Traits especiales de la Kin
    schema.specialTraits = new fields.StringField({
      initial: "",
      blank: true,
    });

    // Culturas sugeridas (guardamos los codes de Culture o texto libre)
    schema.suggestedCultures = new fields.StringField({
      initial: "",
      blank: true,
    });

    return schema;
  }
}
