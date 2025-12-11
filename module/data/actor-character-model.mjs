import VsDActorBaseModel from "./base-actor-model.mjs";

const SKILL_STATS = Object.freeze([
  "brawn",
  "swiftness",
  "fortitude",
  "wits",
  "wisdom",
  "bearing",
]);

// Definición de stats principales: clave + código
const STAT_DEFINITIONS = Object.freeze({
  brawn: { code: "brn" },
  swiftness: { code: "swi" },
  fortitude: { code: "for" },
  wits: { code: "wit" },
  wisdom: { code: "wsd" },
  bearing: { code: "bea" },
});

const MAGIC_STAT_KEYS = Object.freeze({
  wits: { code: "wit" },
  wisdom: { code: "wsd" },
  bearing: { code: "bea" },
});

// Categorías de skills y sus skills internas
const SKILL_CATEGORY_DEFINITIONS = Object.freeze({
  armor: ["armor"],
  combat: ["blunt", "blades", "ranged", "polearms", "brawl"],
  adventuring: ["athletics", "ride", "hunting", "nature", "wandering"],
  roguery: ["acrobatics", "stealth", "locksAndTraps", "perception", "deceive"],
  lore: ["arcana", "charisma", "cultures", "healer", "songsAndTales"],
  body: ["body"],
});

/* Helpers */

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

function makeTotalStatField(fields, requiredInteger) {
  return new fields.NumberField({
    ...requiredInteger,
    initial: 0,
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

function makeSkillCategorySchema(fields, requiredInteger, skillNames) {
  const skillsSchema = {};

  for (const name of skillNames) {
    skillsSchema[name] = makeSkillSchema(fields, requiredInteger);
  }

  return new fields.SchemaField({
    skills: new fields.SchemaField(skillsSchema),
  });
}

function makeStatsSchema(fields, requiredInteger) {
  const statsSchema = {};
  for (const [key, { code }] of Object.entries(STAT_DEFINITIONS)) {
    statsSchema[key] = new fields.SchemaField({
      code: new fields.StringField({
        initial: code,
        blank: false,
      }),
      base: makeStatField(fields, requiredInteger),
      kin: makeStatField(fields, requiredInteger),
      spec: makeStatField(fields, requiredInteger),
      total: makeTotalStatField(fields, requiredInteger),
    });
  }
  return new fields.SchemaField(statsSchema);
}

export default class VsDActorCharacterModel extends VsDActorBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };

    // Base (HP, biography, etc.)
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

    // 2) Stats
    schema.stats = makeStatsSchema(fields, requiredInteger);

    // 3) Skills
    const skillCategoriesSchema = {};
    for (const [categoryKey, skillNames] of Object.entries(
      SKILL_CATEGORY_DEFINITIONS
    )) {
      skillCategoriesSchema[categoryKey] = makeSkillCategorySchema(
        fields,
        requiredInteger,
        skillNames
      );
    }
    schema.skills = new fields.SchemaField(skillCategoriesSchema);

    // 4) Spell Lores
    schema.spellLores = new fields.ArrayField(
      new fields.SchemaField({
        code: new fields.StringField({ initial: "", blank: true }),
        name: new fields.StringField({ initial: "", blank: true }),
        statKey: new fields.StringField({
          initial: MAGIC_STAT_KEYS ? Object.keys(MAGIC_STAT_KEYS)[0] : "",
          blank: false,
          choices: Object.keys(MAGIC_STAT_KEYS),
        }),
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

        knownSpells: new fields.ArrayField(
          new fields.StringField({ initial: "", blank: true }),
          { initial: [] }
        ),
      })
    );

    // 5) Wealth
    schema.wealth = new fields.SchemaField({
      wealthLevel: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      status: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
    });

    // 6) Encumbrance
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

    // 7) Magic Points
    schema.magicPoints = new fields.SchemaField({
      total: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      current: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      kinBase: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      magicStatBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      specialBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      vocationBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    // 8) Drive Points
    schema.drivePoints = new fields.SchemaField({
      total: new fields.NumberField({
        ...requiredInteger,
        initial: 1,
        min: 0,
        max: 5,
      }),
      current: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
        max: 5,
      }),
    });

    // 9) Background Points
    schema.backgroundPoints = new fields.SchemaField({
      total: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
    });

    // 10) Movement
    schema.movement = new fields.SchemaField({
      rate: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
        min: 0,
      }),
      encumbranceLevel: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    return schema;
  }
}
