import VsDActorBaseModel from "./base-actor-model.mjs";

const MOVEMENT_TYPE = Object.freeze(["L", "F", "S"]);
const ARMOR_TYPES = Object.freeze([
  "NA",
  "LA",
  "LAs",
  "ME",
  "MEs",
  "HE",
  "HEs",
]);
const requiredInteger = { required: true, nullable: false, integer: true };

export default class VsDNpcData extends VsDActorBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    // 1) DETAILS
    // Solo campos reales del bestiario: Level y CT
    schema.details = new fields.SchemaField({
      level: new fields.NumberField({
        ...requiredInteger,
        min: 1,
        initial: 1,
      }),
      // CT: código mecánico tal cual (NH, HB, EB...)
      creatureType: new fields.StringField({
        initial: "",
        blank: true,
      }),
    });

    // 2) MOVE RATE
    // El bestiario da algo tipo "15L/10S"
    schema.movement = new fields.SchemaField({
      // Cadena original por si quieres mostrarla tal cual
      raw: new fields.StringField({
        initial: "",
        blank: true,
      }),
      // Primer valor (el “principal”)
      primary: new fields.SchemaField({
        value: new fields.NumberField({
          ...requiredInteger,
          initial: 0, // metros / asalto
        }),
        mode: new fields.StringField({
          initial: "", // "L", "F", "S"
          blank: true,
          choices: MOVEMENT_TYPE,
        }),
      }),
      // Resto de modos (si los hay): "10S", "20F", etc.
      other: new fields.ArrayField(
        new fields.SchemaField({
          value: new fields.NumberField({
            ...requiredInteger,
            initial: 0,
          }),
          mode: new fields.StringField({
            initial: "",
            blank: true,
            choices: MOVEMENT_TYPE,
          }),
        }),
        { initial: [] }
      ),
    });

    // 3) COMBAT STATS (AT, DEF, TSR, WSR, HPs)
    schema.combat = new fields.SchemaField({
      armorType: new fields.StringField({
        initial: "",
        blank: true,
        choices: ARMOR_TYPES,
      }),
      defenseBonus: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      toughnessSave: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
      willpowerSave: new fields.NumberField({
        ...requiredInteger,
        initial: 0,
      }),
    });

    // 4) SKILLS (Rog, Adv, Lor)
    schema.skills = new fields.SchemaField({
      roguery: new fields.NumberField({
        ...requiredInteger,
        code: "rog",
        initial: 0,
      }),
      adventure: new fields.NumberField({
        ...requiredInteger,
        code: "adv",
        initial: 0,
      }),
      lore: new fields.NumberField({
        ...requiredInteger,
        code: "lor",
        initial: 0,
      }),
    });

    const attackField = () =>
      new fields.SchemaField({
        label: new fields.StringField({
          initial: "", // "1st Atk", "2nd Atk" o nombre personalizado
          blank: true,
        }),
        combatBonus: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
        }),
        size: new fields.StringField({
          initial: "",
          blank: true, // tamaño del ataque: "Small", "Medium", etc., solo si el libro lo indica
        }),
        type: new fields.StringField({
          initial: "", // Weapon, Claw, Bite, etc.
          blank: true,
        }),
        times: new fields.NumberField({
          ...requiredInteger,
          min: 1,
          initial: 1, // valor de (x2), (x3)...; por defecto 1
        }),
        followUpOnCrit: new fields.BooleanField({
          initial: false, // true si en el bestiario el ataque lleva *
        }),
        notes: new fields.StringField({
          initial: "",
          blank: true, // cualquier texto adicional que venga en el statblock
        }),
      });

    // Lista general de ataques (para más de 3 si hiciera falta)
    schema.attacks = new fields.ArrayField(attackField(), {
      initial: [],
    });

    // 6) SPECIAL, COMBAT TACTICS, DESCRIPTION
    schema.special = new fields.SchemaField({
      // Línea "Special: ..." de la tabla
      summary: new fields.StringField({
        initial: "",
        blank: true,
      }),
      // Descripción narrativa de la criatura (Name & Description del libro)
      description: new fields.HTMLField({
        initial: "",
      }),
      // Sección Combat Tactics
      tactics: new fields.HTMLField({
        initial: "",
      }),
      // Lista de Special Abilities: nombre en negrita + texto
      abilities: new fields.ArrayField(
        new fields.SchemaField({
          name: new fields.StringField({
            initial: "",
            blank: true,
          }),
          description: new fields.HTMLField({
            initial: "",
          }),
        }),
        { initial: [] }
      ),
    });

    return schema;
  }

  static validateJoint(data) {
    // Validaciones del base-actor (HPs, etc.)
    super.validateJoint(data);

    if (!data) return;

    const { details, movement, combat, attacks, fixedAttacks } = data;

    // DETAILS
    if (details) {
      const lvl = details.level;
      if (typeof lvl === "number" && lvl < 1) {
        throw new Error("NPC level must be at least 1.");
      }

      if (details.creatureType && typeof details.creatureType === "string") {
        const creatureType = details.creatureType.trim();
        if (creatureType && creatureType.length < 2) {
          throw new Error(
            "NPC CT must be a two-letter code like 'NH' or 'HB'."
          );
        }
      }
    }

    // MOVEMENT
    if (movement) {
      const validateMove = (movement, where) => {
        if (!movement) return;
        const value = Number.isFinite(movement.value) ? movement.value : 0;
        const mode = movement.mode;

        if (value < 0) {
          throw new Error(`NPC movement value in ${where} cannot be negative.`);
        }

        if (mode && !MOVEMENT_TYPE.includes(mode)) {
          throw new Error(
            `Invalid movement mode "${mode}" in ${where}. Use one of: ${MOVEMENT_TYPE.join(
              ", "
            )}.`
          );
        }
      };

      validateMove(movement.primary, "movement.primary");

      if (Array.isArray(movement.other)) {
        for (let i = 0; i < movement.other.length; i++) {
          validateMove(movement.other[i], `movement.other[${i}]`);
        }
      }
    }

    // COMBAT
    if (combat) {
      if (combat.armorType && !ARMOR_TYPES.includes(combat.armorType)) {
        throw new Error(
          `Invalid armor type "${
            combat.armorType
          }" for NPC. Use one of: ${ARMOR_TYPES.join(", ")}.`
        );
      }
    }

    // ATTACKS
    const validateAttack = (atk, where) => {
      if (!atk) return;
      if (typeof atk.times === "number" && atk.times < 1) {
        throw new Error(`NPC attack times in ${where} must be at least 1.`);
      }
    };

    if (Array.isArray(attacks)) {
      for (let i = 0; i < attacks.length; i++) {
        validateAttack(attacks[i], `attacks[${i}]`);
      }
    }
  }
}
