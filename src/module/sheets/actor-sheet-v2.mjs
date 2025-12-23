// vsd-actor-sheet-v2.mjs
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class VsDActorSheetV2 extends HandlebarsApplicationMixin(
  foundry.applications.sheets.ActorSheetV2
) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["vsd", "sheet", "actor", "character"],
    position: { width: 820, height: 900 },
    window: { resizable: true },
  });

  // En v13, lo habitual es usar PARTS (plantillas por “fragmentos”)
  static PARTS = {
    main: {
      template: "systems/vsd-system/templates/actor/actor-character-sheet.hbs",
    },
  };

  // Contexto que llega al/los HBS
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Lo típico: exponer actor + system + config
    context.actor = this.actor;
    context.system = this.actor.system;
    context.config = CONFIG.VSD_SYSTEM ?? {};

    return context;
  }

  // Si tienes listeners, en v13 se hace aquí
  _onRender(context, options) {
    super._onRender(context, options);

    // Ejemplo: enganchar eventos dentro de la app
    // this.element.querySelector("[data-action='foo']")?.addEventListener("click", () => {});
  }
}
