import VsDActorBase from "./base-actor.mjs";

export default class VsDCharacter extends VsDActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    const statField = () =>
      new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: -20,
        max: 35,
        validate: (value) => {
          // Only allow multiples of 5.
          if (!Number.isFinite(value)) return "Stat must be a number.";
          if (value % 5 !== 0) return "Stat must be a multiple of 5.";
          return true;
        },
      });

    schema.identity = new fields.SchemaField({
      kin: new fields.SchemaField({
        itemCode: new fields.StringField({
          initial: "",
          blank: true,
        }),
        name: new fields.StringField({
          initial: "",
          blank: true,
        }),
      }),
      culture: new fields.SchemaField({
        itemCode: new fields.StringField({
          initial: "",
          blank: true,
        }),
        name: new fields.StringField({
          initial: "",
          blank: true,
        }),
      }),
      vocation: new fields.SchemaField({
        itemCode: new fields.StringField({
          initial: "",
          blank: true,
        }),
        name: new fields.StringField({
          initial: "",
          blank: true,
        }),
      }),

      xp: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),

      level: new fields.NumberField({
        ...requiredInteger,
        initial: 1,
        min: 1,
      }),

      motivation: new fields.StringField({
        initial: "",
        blank: true,
      }),

      nature: new fields.StringField({
        initial: "",
        blank: true,
      }),

      allegiance: new fields.StringField({
        initial: "",
        blank: true,
      }),
    });

    schema.stats = new fields.SchemaField({
      brawn: new fields.SchemaField({
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: -20,
          max: 35,
          readonly: true,
        }),
      }),

      swiftness: new fields.SchemaField({
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: -20,
          max: 35,
          readonly: true,
        }),
      }),

      fortitude: new fields.SchemaField({
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: -20,
          max: 35,
          readonly: true,
        }),
      }),

      wits: new fields.SchemaField({
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: -20,
          max: 35,
          readonly: true,
        }),
      }),

      wisdom: new fields.SchemaField({
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: -20,
          max: 35,
          readonly: true,
        }),
      }),

      bearing: new fields.SchemaField({
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: -20,
          max: 35,
          readonly: true,
        }),
      }),
    });

    /**
     * OLD ATTRIBUTES STRUCTURE
     */
    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(
      Object.keys(CONFIG.VSD_SYSTEM.abilities).reduce((obj, ability) => {
        obj[ability] = new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 10,
            min: 0,
          }),
        });
        return obj;
      }, {})
    );

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system;
    if (!system) return;

    const stats = system.stats;
    if (!stats) return;

    // Calculate total stats by summing base, kin, and spec.
    for (const [key, stat] of Object.entries(stats)) {
      const base = Number(stat.base) || 0;
      const kin = Number(stat.kin) || 0;
      const spec = Number(stat.spec) || 0;
      stat.total = base + kin + spec;
    }

    // Aquí más adelante podrás añadir otros derivados (defenses, saves, etc.),
    // siempre comprobando que system.loQueSea existe antes de usarlo.
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data;
  }
}
