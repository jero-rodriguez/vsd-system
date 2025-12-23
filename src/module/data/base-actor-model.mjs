import VsDDataModel from "./base-model.mjs";

export default class VsDActorBaseModel extends VsDDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.hitPoints = new fields.SchemaField({
      current: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),

      maxHitPoints: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),

      backgroundBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),

      itemBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),

      specBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    schema.wounds = new fields.SchemaField({
      bleed: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      stunned: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
      penalties: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
        max: 100,
      }),
      conditions: new fields.ArrayField(
        new fields.StringField({ blank: false }),
        {
          required: true,
          nullable: false,
          initial: [],
        }
      ),
      injuries: new fields.ArrayField(
        new fields.StringField({ blank: false }),
        {
          required: true,
          nullable: false,
          initial: [],
        }
      ),
    });

    schema.saves = new fields.SchemaField({
      // Buckets aportados por Kin
      kinTsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      kinWsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),

      // Buckets aportados por Special Bonus (si existe)
      specTsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      specWsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),

      // Preparado para futuro (equipo, efectos, etc.)
      itemTsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      itemWsr: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
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

    if (hp.current < 0) {
      throw new Error("Hit Points current must be >= 0.");
    }
  }
}
