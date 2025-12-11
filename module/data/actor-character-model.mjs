import VsDActorBaseModel from "./base-actor-model.mjs";

const SKILL_STATS = Object.freeze([
  "brawn",
  "swiftness",
  "fortitude",
  "wits",
  "wisdom",
  "bearing",
]);

function makeStatField(fields, requiredInteger) {
  return new fields.NumberField({
    ...requiredInteger,
    initial: 0,
    min: -20,
    max: 35,
    validate: (value) => {
      if (!Number.isFinite(value)) return "Stat must be a number.";
      if (value % 5 !== 0) return "Stat must be a multiple of 5.";
      return true;
    },
  });
}

function makeSkillSchema(fields, requiredInteger) {
  return new fields.SchemaField({
    stat: new fields.StringField({
      initial: "",
      blank: true,
      choices: SKILL_STATS,
    }),

    ranks: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
    }),

    rankBonus: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
    }),

    voc: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
    }),

    kin: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
    }),

    spec: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
    }),

    item: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
    }),

    total: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
    }),
  });
}

function makeSkillCategorySchema(fields, requiredInteger, definition) {
  const skillsSchema = {};
  for (const name of Object.keys(definition)) {
    skillsSchema[name] = makeSkillSchema(fields, requiredInteger);
  }

  return new fields.SchemaField({
    dpPerLevel: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
      max: 5,
    }),
    skills: new fields.SchemaField(skillsSchema),
  });
}

export default class VsDActorCharacterModel extends VsDActorBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };

    // Empezamos por el schema base (HP, biography, etc.)
    const schema = super.defineSchema();

    // 1) Identity
    schema.identity = new fields.SchemaField({
      kin: new fields.SchemaField({
        itemCode: new fields.StringField({ initial: "", blank: true }),
        name: new fields.StringField({ initial: "", blank: true }),
      }),
      culture: new fields.SchemaField({
        itemCode: new fields.StringField({ initial: "", blank: true }),
        name: new fields.StringField({ initial: "", blank: true }),
      }),
      vocation: new fields.SchemaField({
        itemCode: new fields.StringField({ initial: "", blank: true }),
        name: new fields.StringField({ initial: "", blank: true }),
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

      motivation: new fields.StringField({ initial: "", blank: true }),
      nature: new fields.StringField({ initial: "", blank: true }),
      allegiance: new fields.StringField({ initial: "", blank: true }),
    });

    // 2) Stats (tu bloque de stats con base/kin/spec/total)
    const statField = () => makeStatField(fields, requiredInteger);
    const totalField = () =>
      new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      });

    schema.stats = new fields.SchemaField({
      brawn: new fields.SchemaField({
        code: new fields.StringField({
          initial: "brn",
          blank: false,
        }),
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: totalField(),
      }),
      swiftness: new fields.SchemaField({
        code: new fields.StringField({
          initial: "swi",
          blank: false,
        }),
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: totalField(),
      }),
      fortitude: new fields.SchemaField({
        code: new fields.StringField({
          initial: "for",
          blank: false,
        }),
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: totalField(),
      }),
      wits: new fields.SchemaField({
        code: new fields.StringField({
          initial: "wit",
          blank: false,
        }),
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: totalField(),
      }),
      wisdom: new fields.SchemaField({
        code: new fields.StringField({
          initial: "wsd",
          blank: false,
        }),
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: totalField(),
      }),
      bearing: new fields.SchemaField({
        code: new fields.StringField({
          initial: "bea",
          blank: false,
        }),
        base: statField(),
        kin: statField(),
        spec: statField(),
        total: totalField(),
      }),
    });

    // 3) Skills (tu bloque de skills con makeSkillCategorySchema, etc.)
    schema.skills = new fields.SchemaField({
      armor: makeSkillCategorySchema(fields, requiredInteger, {
        armor: {},
      }),
      combat: makeSkillCategorySchema(fields, requiredInteger, {
        blunt: {},
        blades: {},
        ranged: {},
        polearms: {},
        brawl: {},
      }),
      adventuring: makeSkillCategorySchema(fields, requiredInteger, {
        athletics: {},
        ride: {},
        hunting: {},
        nature: {},
        wandering: {},
      }),
      roguery: makeSkillCategorySchema(fields, requiredInteger, {
        acrobatics: {},
        stealth: {},
        locksAndTraps: {},
        perception: {},
        deceive: {},
      }),
      lore: makeSkillCategorySchema(fields, requiredInteger, {
        arcana: {},
        charisma: {},
        cultures: {},
        healer: {},
        songsAndTales: {},
      }),
      body: makeSkillCategorySchema(fields, requiredInteger, {
        body: {},
      }),
    });

    // 4) Spell Lores
    schema.spellLores = new fields.ArrayField(
      new fields.SchemaField({
        loreId: new fields.StringField({ initial: "", blank: true }), // id o código de item Spell Lore
        name: new fields.StringField({ initial: "", blank: true }),

        statKey: new fields.StringField({ initial: "", blank: true }),

        ranks: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0,
        }),
        rankBonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        voc: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        kin: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        spec: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        item: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        total: new fields.NumberField({ ...requiredInteger, initial: 0 }),

        // Opcional: lista de spells aprendidos (por id o código)
        knownSpells: new fields.ArrayField(
          new fields.StringField({ initial: "", blank: true }),
          { initial: [] }
        ),
      })
    );

    // 5) Inventory summary: wealth + encumbrance
    // Esto es solo el resumen en el actor; los objetos reales irán como Items.
    schema.wealth = new fields.SchemaField({
      coins: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      treasure: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
    });

    schema.encumbrance = new fields.SchemaField({
      carriedWeight: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      maxWeight: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      penalty: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    // 6) LEGACY (boilerplate d20) – solo si aún lo necesitas
    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
    });

    schema.abilities = new fields.SchemaField(
      Object.keys(CONFIG.VSD_SYSTEM.abilities ?? {}).reduce((obj, ability) => {
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
}
