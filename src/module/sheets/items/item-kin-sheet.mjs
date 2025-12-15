const { HandlebarsApplicationMixin } = foundry.applications.api;

export class VsDKinSheet extends HandlebarsApplicationMixin(
  foundry.applications.sheets.ItemSheetV2
) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    id: "vsd-kin-sheet",
    classes: ["vsd", "sheet", "item", "kin", "vsd-kin-section"],
    tag: "form",
    form: {
      handler: VsDKinSheet.#onSubmit,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    window: {
      resizable: true,
      title: true,
    },
    position: {
      width: 760,
      height: 780,
    },
  });

  static PARTS = {
    form: { template: "systems/vsd-system/templates/items/item-kin-sheet.hbs" },
  };

  get title() {
    return this.document.name ?? "Kin";
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Datos del Item
    context.item = this.document;
    context.system = this.document.system;

    // Choices útiles
    context.qualityChoices = {
      low: "low",
      normal: "normal",
      superior: "superior",
      masterwork: "masterwork",
    };

    return context;
  }

  static async #onSubmit(event, form, formData) {
    // formData ya viene “flattened” con keys tipo "system.stats.brn"
    const updateData = formData.object;

    // Limpieza mínima: arrays vacíos, etc. (opcional)
    // Si en tu HBS introduces textarea para traits por líneas, aquí es donde lo parseas.
    return this.document.update(updateData);
  }
}
