// Import document classes.
import { VsDCharacter } from "./documents/actor-character.mjs";
import { VsDNpc } from "./documents/actor-npc.mjs";
import { VsDItem } from "./documents/item.mjs";
// Import sheet classes.
import { VsDActorSheet } from "./sheets/actor-sheet.mjs";
import { VsDItemSheet } from "./sheets/item-sheet.mjs";
import { VsDKinSheet } from "./sheets/items/item-kin-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { VSD_SYSTEM } from "./helpers/config.mjs";
// Import DataModel classes
import * as models from "./data/_module.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */
Hooks.once("init", function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.vsdsystem = {
    VsDCharacter,
    VsDNpc,
    VsDItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.VSD_SYSTEM = VSD_SYSTEM;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d100",
    decimals: 0,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = VsDCharacter;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.VsDCharacter,
    npc: models.VsDNPC,
  };
  CONFIG.Item.documentClass = VsDItem;
  CONFIG.Item.dataModels = {
    gear: models.VsDGear,
    feature: models.VsDFeature,
    weapon: models.VsDWeapon,
    armor: models.VsDArmor,
    spell: models.VsDSpell,
    spellLore: models.VsDSpellLore,
    kin: models.VsDKinModel,
    culture: models.VsDCultureModel,
    vocation: models.VsDVocationModel,
  };
  // Asegurarnos de que existe el objeto systemDataModels
  CONFIG.Item.systemDataModels = CONFIG.Item.systemDataModels || {};

  // Mapear tipos de item a DataModels
  CONFIG.Item.systemDataModels["gear"] = models.VsDGear;
  CONFIG.Item.systemDataModels["feature"] = models.VsDFeature;
  CONFIG.Item.systemDataModels["weapon"] = models.VsDWeapon;
  CONFIG.Item.systemDataModels["armor"] = models.VsDArmor;
  CONFIG.Item.systemDataModels["spellLore"] = models.VsDSpellLore;
  CONFIG.Item.systemDataModels["spell"] = models.VsDSpell;

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet(
    "core",
    foundry.appv1.sheets.ActorSheet
  );
  foundry.documents.collections.Actors.registerSheet(
    "vsd-system",
    VsDActorSheet,
    {
      makeDefault: true,
      label: "VSD_SYSTEM.SheetLabels.Actor",
    }
  );
  foundry.documents.collections.Items.unregisterSheet(
    "core",
    foundry.appv1.sheets.ItemSheet
  );
  foundry.documents.collections.Items.registerSheet(
    "vsd-system",
    VsDItemSheet,
    {
      makeDefault: false,
      label: "VSD_SYSTEM.SheetLabels.Item (Legacy V1)",
    }
  );

  /* foundry.applications.sheets.registerSheet("vsd-system", Item, {
    types: [
      "gear",
      "feature",
      "weapon",
      "armor",
      "spell",
      "spellLore",
      "culture",
      "vocation",
    ],
    sheetClass: VsDItemSheet,
    makeDefault: false,
    label: "VSD_SYSTEM.SheetLabels.Item",
  }); */

  foundry.documents.collections.Items.registerSheet("vsd-system", VsDKinSheet, {
    types: ["kin"],
    makeDefault: true,
    label: "VsD Kin Sheet (V2)",
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.vsdsystem.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "vsd-system.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
