import VsDItemBaseModel from "./base-item-model.mjs";

const MAGIC_STAT_KEY = Object.freeze({
  wits: { code: "wit" },
  wisdom: { code: "wsd" },
  bearing: { code: "bea" },
});
const fields = foundry.data.fields;
const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDVocationModel extends VsDItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // Development Points por categoría
    schema.developmentPoints = new fields.SchemaField({
      armor: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      combat: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      adventuring: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      roguery: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      lore: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      spells: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      body: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });

    // Bonos vocacionales por Skill concreta (skillCode -> bonus)
    schema.vocationalBonuses = new fields.SchemaField(
      {
        armor: new fields.NumberField({ ...requiredInteger, initial: 0 }),

        blunt: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        blades: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        ranged: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        polearms: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        brawl: new fields.NumberField({ ...requiredInteger, initial: 0 }),

        athletics: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        ride: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        hunting: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        nature: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        wandering: new fields.NumberField({ ...requiredInteger, initial: 0 }),

        acrobatics: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        stealth: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        locksAndTraps: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
        }),
        perception: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        deceive: new fields.NumberField({ ...requiredInteger, initial: 0 }),

        arcana: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        charisma: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        cultures: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        healer: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        songsAndTales: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
        }),

        body: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        spellLores: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      },
      { required: false }
    );

    // Vocational Spell Lores
    schema.vocationalSpellLores = new fields.ArrayField(
      new fields.StringField({ initial: "", required: false, blank: true }),
      { required: false }
    );

    // Stat que se usa para calcular Stat MP Level gain (wits, wisdom o bearing)
    schema.magicStatKey = new fields.StringField({
      initial: "bearing",
      blank: false,
      choices: Object.keys(MAGIC_STAT_KEY),
    });

    // MPs que gana por nivel (Magic Points Gain per Level)
    schema.magicPointsPerLevel = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
    });

    return schema;
  }
}
