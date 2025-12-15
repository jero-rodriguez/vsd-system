export class VsDCharacter extends Actor {
  /** @override */
  prepareData() {
    // Ejecuta: reset de datos, prepareBaseData, prepareEmbeddedDocuments, prepareDerivedData.
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Aquí irían modificaciones antes de procesar documentos embebidos o datos derivados.
  }

  /* -------------------------------------------- */
  /*  Utilidades internas                         */
  /* -------------------------------------------- */

  /**
   * Convierte un valor a número, devolviendo fallback si no es válido.
   */
  _toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  /**
   * Encuentra el item de tipo "kin" asociado al actor.
   */
  _getKinItem() {
    return this.items.find((it) => it.type === "kin") ?? null;
  }

  /**
   * Encuentra el item de tipo "vocation" asociado al actor.
   */
  _getVocationItem() {
    return this.items.find((it) => it.type === "vocation") ?? null;
  }

  /**
   * Bonus por rangos según tabla de VsD.
   * 1–10 → +5 cada rango
   * 11–20 → +2 cada rango
   * 21+ → +1 cada rango
   */
  getRankBonus(ranks) {
    ranks = Math.max(0, Math.floor(this._toNumber(ranks, 0)));

    const firstTier = Math.min(ranks, 10);
    const secondTier = Math.max(Math.min(ranks, 20) - 10, 0);
    const thirdTier = Math.max(ranks - 20, 0);

    return 5 * firstTier + 2 * secondTier + thirdTier;
  }

  /* -------------------------------------------- */
  /*  Cálculo de datos derivados                  */
  /* -------------------------------------------- */

  /**
   * @override
   * Calcula datos derivados que no gestiona el DataModel.
   */
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system;
    if (!system) return;

    this._applyKinModifiers(system);
    this._computeStatsTotals(system);
    this._loadVocationDevelopmentPoints();
    this._applyVocationModifiers(system);
    this._computeMagicPoints(system);
    this._computeSkillTotals(system);
    this._computeSpellLoreTotals(system);
    this._prepareEncumbranceAndMovement(system);
  }

  /**
   * Aplica modificadores de Kin a stats y recursos del actor.
   */
  _applyKinModifiers(system) {
    const kinItem = this._getKinItem();

    // Aseguramos que stats existen y reseteamos el aporte de kin.
    if (system.stats) {
      for (const stat of Object.values(system.stats)) {
        stat.kin = 0;
      }
    }

    // Reseteamos kinBase de MPs
    if (system.magicPoints) {
      system.magicPoints.kinBase = 0;
    }

    if (!kinItem) {
      // Aunque no haya Kin, el bruiseThreshold debe recalcularse.
      if (system.hitPoints?.total != null) {
        system.hitPoints.bruiseThreshold = Math.floor(
          this._toNumber(system.hitPoints.total) / 2
        );
      }
      return;
    }

    const kinSystem = kinItem.system ?? {};
    const kinStats = kinSystem.stats ?? {};
    const kinResources = kinSystem.resources ?? {};

    // 1) Modificadores de stats
    if (system.stats) {
      for (const [key, stat] of Object.entries(system.stats)) {
        const kinValue = kinStats[key];
        if (typeof kinValue === "number") {
          stat.kin = kinValue;
        }
      }
    }

    // 2) Recursos (HP, MP, tiradas de salvación, etc.)
    if (system.hitPoints) {
      if (typeof kinResources.hitPoints === "number") {
        system.hitPoints.total += kinResources.hitPoints;
      }
      if (typeof kinResources.maxHitPoints === "number") {
        system.hitPoints.maxHitPoints += kinResources.maxHitPoints;
      }
    }

    // Magic Points: Kin aporta un "base MP bonus" que guardamos en kinBase.
    if (system.magicPoints) {
      // Aseguramos que existe kinBase
      if (system.magicPoints.kinBase == null) {
        system.magicPoints.kinBase = 0;
      }

      if (typeof kinResources.magicPoints === "number") {
        system.magicPoints.kinBase = this._toNumber(
          kinResources.magicPoints,
          0
        );
      }
    }

    if (system.saves) {
      if (typeof kinResources.tsr === "number") {
        system.saves.toughness += kinResources.tsr;
      }
      if (typeof kinResources.wsr === "number") {
        system.saves.willpower += kinResources.wsr;
      }
    }

    // Background Points
    if (typeof kinResources.backgroundPoints === "number") {
      if (typeof system.backgroundPoints?.total === "number") {
        system.backgroundPoints.total += kinResources.backgroundPoints;
      }
    }

    // Wealth Level inicial
    if (
      system.wealth?.wealthLevel != null &&
      typeof kinResources.initialWealthLevel === "number"
    ) {
      system.wealth.wealthLevel += kinResources.initialWealthLevel;
    }

    // 3) Umbral de magulladura
    if (system.hitPoints?.total != null) {
      system.hitPoints.bruiseThreshold = Math.floor(
        this._toNumber(system.hitPoints.total) / 2
      );
    }
  }

  /**
   * Calcula el total de cada stat (base + kin + spec).
   */
  _computeStatsTotals(system) {
    const stats = system.stats;
    if (!stats) return;

    for (const stat of Object.values(stats)) {
      const base = this._toNumber(stat.base);
      const kin = this._toNumber(stat.kin);
      const spec = this._toNumber(stat.spec);
      stat.total = base + kin + spec;
    }
  }

  /**
   * Carga los Development Points definidos en la Vocation y
   * los guarda en una propiedad auxiliar del actor.
   */
  _loadVocationDevelopmentPoints() {
    const vocationItem = this._getVocationItem();

    if (vocationItem) {
      const dp = vocationItem.system?.developmentPoints ?? {};
      this._vocationDP = foundry.utils.duplicate(dp);
    } else {
      this._vocationDP = {};
    }
  }

  /**
   * Calcula el total de todas las skills del actor.
   */
  _computeSkillTotals(system) {
    if (!system.skills || !system.stats) return;

    for (const category of Object.values(system.skills)) {
      const skills = category.skills ?? {};
      for (const skill of Object.values(skills)) {
        const statKey = skill.stat;
        const statTotal =
          statKey && system.stats[statKey]
            ? this._toNumber(system.stats[statKey].total)
            : 0;

        const ranks = this._toNumber(skill.ranks);
        const voc = this._toNumber(skill.voc);
        const kin = this._toNumber(skill.kin);
        const spec = this._toNumber(skill.spec);
        const item = this._toNumber(skill.item);
        const rankBonus = this.getRankBonus(ranks);

        skill.total = statTotal + rankBonus + voc + kin + spec + item;
      }
    }
  }

  /**
   * Calcula el total de cada Spell Lore (rangos + bonus).
   */
  _computeSpellLoreTotals(system) {
    const stats = system.stats ?? {};
    const lores = system.spellLores;

    if (!Array.isArray(lores)) return;

    for (const lore of lores) {
      if (!lore) continue;

      // 1) Stat ligada al Lore
      const statKey = lore.statKey || "wits";
      const statTotal = this._toNumber(stats[statKey]?.total, 0);

      // 2) Bonus por rangos
      const ranks = this._toNumber(lore.ranks, 0);
      lore.rankBonus = this.getRankBonus(ranks);

      // 3) Otros modificadores
      const voc = this._toNumber(lore.voc, 0);
      const kin = this._toNumber(lore.kin, 0);
      const spec = this._toNumber(lore.spec, 0);
      const item = this._toNumber(lore.item, 0);

      // 4) Total final del Spell Lore
      lore.total = statTotal + lore.rankBonus + voc + kin + spec + item;
    }
  }

  /**
   * Normaliza la información de carga y ajusta el movimiento.
   */
  _prepareEncumbranceAndMovement(system) {
    if (!system.encumbrance) {
      system.encumbrance = {};
    }

    system.encumbrance.carriedWeight = this._toNumber(
      system.encumbrance.carriedWeight
    );
    system.encumbrance.maxWeight = this._toNumber(system.encumbrance.maxWeight);
    system.encumbrance.penalty = this._toNumber(system.encumbrance.penalty);

    // Ajustamos tasa de movimiento (regla actual: 15 - penalizador)
    if (system.movement) {
      system.movement.rate = 15 - system.encumbrance.penalty;
    }
  }

  _applyVocationModifiers(system) {
    const vocationItem = this._getVocationItem();

    // Reset de voc en todas las skills
    if (system.skills) {
      for (const category of Object.values(system.skills)) {
        const skills = category.skills ?? {};
        for (const skill of Object.values(skills)) {
          skill.voc = 0;
        }
      }
    }

    // Reset del bonus vocacional de MPs
    if (system.magicPoints) {
      system.magicPoints.vocationBonus = 0;
    }

    if (Array.isArray(system.spellLores)) {
      for (const lore of system.spellLores) {
        if (!lore) continue;
        lore.voc = 0;
      }
    }

    if (!vocationItem) return;

    const vocSystem = vocationItem.system ?? {};
    const vocBonuses = vocSystem.vocationalBonuses ?? {};
    const mpPerLevel = this._toNumber(vocSystem.magicPointsPerLevel, 0);
    const vocSpellLores = vocSystem.vocationalSpellLores ?? [];

    // 1) Bonos vocacionales a skills (skill.voc)
    if (system.skills && vocBonuses) {
      for (const [skillKey, bonus] of Object.entries(vocBonuses)) {
        const bonusValue = this._toNumber(bonus, 0);
        if (!bonusValue) continue;

        // Buscamos la skill por clave dentro de las categorías
        for (const category of Object.values(system.skills)) {
          const skills = category.skills ?? {};
          if (skills[skillKey]) {
            skills[skillKey].voc = bonusValue;
          }
        }
      }
    }

    // 2) MPs por nivel: guardamos el valor de la Vocation como "vocationBonus" por nivel
    if (system.magicPoints) {
      // Aquí interpretamos vocationBonus como "MPs ganados por nivel desde la Vocation"
      system.magicPoints.vocationBonus = mpPerLevel;
    }

    const spellLoreVocBonus = this._toNumber(
      vocSystem.vocationalBonuses?.spellLores,
      0
    );

    if (spellLoreVocBonus !== 0 && Array.isArray(system.spellLores)) {
      for (const lore of system.spellLores) {
        if (!lore) continue;
        lore.voc = this._toNumber(lore.voc, 0) + spellLoreVocBonus;
      }
    }
  }

  _computeMagicPoints(system) {
    if (!system.magicPoints) return;

    const magicPoints = system.magicPoints;
    const level = this._toNumber(system.identity?.level, 1);
    // 1) Stat MP Level gain (Magic & Spells, cap. 12)
    //    Wizards → Wits, Animists → Wisdom, otros → Bearing.
    const vocationItem = this._getVocationItem();
    const vocSystem = vocationItem?.system ?? {};
    const magicStatKey = vocSystem.magicStatKey || "bearing";
    const stats = system.stats ?? {};
    const magicStatTotal = this._toNumber(stats[magicStatKey]?.total, 0);
    // Ganancia de MPs por nivel según el Stat: 1 MP por cada 10 puntos completos
    const statGainPerLevel = Math.floor(magicStatTotal / 10);
    const statMPs = level * statGainPerLevel;
    magicPoints.magicStatBonus = statMPs;
    // 2) Vocation MP per Level (desde el item de Vocation)
    const mpPerLevel = this._toNumber(vocSystem.magicPointsPerLevel, 0);
    const vocationMPs = level * mpPerLevel;
    magicPoints.vocationBonus = vocationMPs;
    // 3) Kin base MP bonus (es un flat bonus, no por nivel)
    const kinBase = this._toNumber(magicPoints.kinBase, 0);
    // 4) Special Bonus (por objetos, Revelations, etc.)
    const specialBonus = this._toNumber(magicPoints.specialBonus, 0);
    // Total final
    magicPoints.total =
      kinBase +
      magicPoints.magicStatBonus +
      magicPoints.vocationBonus +
      specialBonus;
    // Ajustar current si se ha quedado por encima del nuevo total
    const current = this._toNumber(magicPoints.current, 0);
    if (current > magicPoints.total) {
      magicPoints.current = magicPoints.total;
    }
  }

  /* -------------------------------------------- */
  /*  Datos para tiradas                          */
  /* -------------------------------------------- */

  getRollData2() {
    const data = super.getRollData ? super.getRollData() : {};
    // Si quieres exponer cosas de system para fórmulas, las añades aquí.
    return data;
  }

  /**
   * @override
   * Extiende getRollData() con los datos del DataModel.
   */
  getRollData() {
    return {
      ...super.getRollData(),
      ...(this.system.getRollData?.() ?? null),
    };
  }

  /* -------------------------------------------- */
  /*  Serialización auxiliar                      */
  /* -------------------------------------------- */

  /**
   * Convierte el actor a un objeto plano, incluyendo system, items y efectos.
   */
  toPlainObject() {
    const result = { ...this };

    // Simplifica system.
    result.system = this.system.toPlainObject();

    // Items.
    result.items = this.items?.size > 0 ? this.items.contents : [];

    // Efectos.
    result.effects = this.effects?.size > 0 ? this.effects.contents : [];

    return result;
  }
}
