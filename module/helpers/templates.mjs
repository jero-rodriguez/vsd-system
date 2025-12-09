/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return foundry.applications.handlebars.loadTemplates([
    // Actor partials.
    "systems/vsd-system/templates/actor/parts/actor-features.hbs",
    "systems/vsd-system/templates/actor/parts/actor-items.hbs",
    "systems/vsd-system/templates/actor/parts/actor-spells.hbs",
    "systems/vsd-system/templates/actor/parts/actor-effects.hbs",
    // Item partials
    "systems/vsd-system/templates/item/parts/item-effects.hbs",
  ]);
};
