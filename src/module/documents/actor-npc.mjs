export class VsDNpc extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system;
    if (!system) return;

    // Lógica de derivados para PNJs,
    // usando system.basic, system.hitPoints, etc.
  }
}
