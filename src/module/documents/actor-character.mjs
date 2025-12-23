export class VsDCharacter extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // No-op por ahora
  }

  /* -------------------------------------------- */
  /*  Utilidades internas                         */
  /* -------------------------------------------- */

  _toNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  _getKinItem() {
    return this.items.find((it) => it.type === "kin") ?? null;
  }

  _getVocationItem() {
    return this.items.find((it) => it.type === "vocation") ?? null;
  }

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

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system;
    if (!system) return;

    // Salida calculada (NO está en schema; se crea en runtime)
    system.derived ??= {};
    const derived = system.derived;

    // Reset determinista de buckets que provienen de items
    this._resetComputedBuckets(system);

    // Aplicar contribuciones desde items (solo rellenan buckets INPUT)
    this._applyKinToBuckets(system, derived);
    this._loadVocationDevelopmentPoints();
    this._applyVocationToBuckets(system, derived);

    // Derivados (siempre desde cero)
    this._computeDerivedStats(system, derived);
    this._computeDerivedSkills(system, derived);
    this._computeDerivedSpellLores(system, derived);

    this._computeDerivedSaves(system, derived);
    this._computeDerivedWealth(system, derived);
    this._computeDerivedBackgroundPoints(system, derived);

    this._computeDerivedMagicPoints(system, derived);
    this._computeDerivedHitPoints(system, derived);

    this._computeDerivedEncumbranceAndMovement(system, derived);
  }

  /* -------------------------------------------- */
  /*  Reset de buckets                            */
  /* -------------------------------------------- */

  _resetComputedBuckets(system) {
    // Stats: kin se rellena desde Kin item
    if (system.stats) {
      for (const stat of Object.values(system.stats)) {
        stat.kin = 0;
      }
    }

    // Skills: voc/kin/item se rellenan desde Vocation/Kin/Items
    if (system.skills) {
      for (const category of Object.values(system.skills)) {
        const skills = category.skills ?? {};
        for (const skill of Object.values(skills)) {
          skill.voc = 0;
          skill.kin = 0;
          skill.item = 0;
          // skill.spec se considera input del usuario (no se resetea)
        }
      }
    }

    // Spell lores: voc/kin/item se rellenan desde Vocation/Kin/Items
    if (Array.isArray(system.spellLores)) {
      for (const lore of system.spellLores) {
        if (!lore) continue;
        lore.voc = 0;
        lore.kin = 0;
        lore.item = 0;
        // lore.spec input del usuario (no se resetea)
      }
    }

    // MP: kinBase se rellena desde Kin; specialBonus es input
    if (system.magicPoints) {
      system.magicPoints.kinBase = 0;
      system.magicPoints.specialBonus = this._toNumber(
        system.magicPoints.specialBonus,
        0
      );
    }

    // HP cap: maxHitPoints se rellena desde Kin; el resto son inputs preparados (background/item/spec)
    if (system.hitPoints) {
      system.hitPoints.maxHitPoints = 0;
      system.hitPoints.backgroundBonus = this._toNumber(
        system.hitPoints.backgroundBonus,
        0
      );
      system.hitPoints.itemBonus = this._toNumber(
        system.hitPoints.itemBonus,
        0
      );
      system.hitPoints.specBonus = this._toNumber(
        system.hitPoints.specBonus,
        0
      );
      system.hitPoints.current = this._toNumber(system.hitPoints.current, 0);
    }

    if (system.saves) {
      system.saves.kinTsr = 0;
      system.saves.kinWsr = 0;
      system.saves.itemTsr = 0;
      system.saves.itemWsr = 0;
    }
  }

  /* -------------------------------------------- */
  /*  Kin                                         */
  /* -------------------------------------------- */

  _applyKinToBuckets(system, derived) {
    const kinItem = this._getKinItem();

    derived.identity ??= {};
    derived.identity.kin = null;

    // Limpia “bonos kin” en derived (solo por claridad/debug)
    derived.kin ??= {
      tsr: 0,
      wsr: 0,
      backgroundPoints: 0,
      initialWealthLevel: 0,
    };
    derived.kin.tsr = 0;
    derived.kin.wsr = 0;
    derived.kin.backgroundPoints = 0;
    derived.kin.initialWealthLevel = 0;

    if (!kinItem) return;

    const kinSystem = kinItem.system ?? {};
    const kinStats = kinSystem.stats ?? {};
    const kinResources = kinSystem.resources ?? {};

    derived.identity.kin = {
      code: kinSystem.code ?? "",
      name: kinItem.name ?? "",
    };

    // 1) Stats kin bucket
    if (system.stats) {
      for (const [key, stat] of Object.entries(system.stats)) {
        const kinValue = kinStats[stat.code];
        if (typeof kinValue === "number") stat.kin = kinValue;
      }
    }

    // 2) HP cap desde Kin
    if (system.hitPoints && typeof kinResources.maxHitPoints === "number") {
      system.hitPoints.maxHitPoints = this._toNumber(
        kinResources.maxHitPoints,
        0
      );
    }

    // 3) HP total: si el Kin da un bono de HP, se aplica a la skill Body (porque HP total = Body)
    // Kin.resources.hitPoints -> skill "body".kin
    const bodySkill = system.skills?.body?.skills?.body;
    if (bodySkill && typeof kinResources.hitPoints === "number") {
      bodySkill.kin = this._toNumber(kinResources.hitPoints, 0);
    }

    // 4) MP base desde Kin
    if (system.magicPoints && typeof kinResources.magicPoints === "number") {
      system.magicPoints.kinBase = this._toNumber(kinResources.magicPoints, 0);
    }

    // 5) Saves kin buckets
    if (system.saves) {
      system.saves.kinTsr = this._toNumber(kinResources.tsr, 0);
      system.saves.kinWsr = this._toNumber(kinResources.wsr, 0);
    }

    // 6) Background Points kin (se aplican en derived.backgroundPoints)
    if (typeof kinResources.backgroundPoints === "number") {
      derived.kin.backgroundPoints = this._toNumber(
        kinResources.backgroundPoints,
        0
      );
    }

    // 7) Wealth Level inicial por Kin (se aplica en derived.wealth)
    if (typeof kinResources.initialWealthLevel === "number") {
      derived.kin.initialWealthLevel = this._toNumber(
        kinResources.initialWealthLevel,
        0
      );
    }
  }

  /* -------------------------------------------- */
  /*  Vocation                                    */
  /* -------------------------------------------- */

  _loadVocationDevelopmentPoints() {
    const vocationItem = this._getVocationItem();
    if (vocationItem) {
      const dp = vocationItem.system?.developmentPoints ?? {};
      this._vocationDP = foundry.utils.duplicate(dp);
    } else {
      this._vocationDP = {};
    }
  }

  _applyVocationToBuckets(system, derived) {
    const vocationItem = this._getVocationItem();
    derived.identity ??= {};
    derived.identity.vocation = null;

    if (!vocationItem) return;

    const vocSystem = vocationItem.system ?? {};
    derived.identity.vocation = {
      code: vocSystem.code ?? "",
      name: vocationItem.name ?? "",
    };

    const vocBonuses = vocSystem.vocationalBonuses ?? {};
    const vocSpellLores = vocSystem.vocationalSpellLores ?? [];

    // 1) Bonos vocacionales a skills (skill.voc)
    if (system.skills && vocBonuses) {
      for (const [skillKey, bonus] of Object.entries(vocBonuses)) {
        const bonusValue = this._toNumber(bonus, 0);
        if (!bonusValue) continue;

        for (const category of Object.values(system.skills)) {
          const skills = category.skills ?? {};
          if (skills[skillKey]) skills[skillKey].voc = bonusValue;
        }
      }
    }

    // 2) Bonus plano a todos los Spell Lores (si existe)
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

    // 3) Bonos a Spell Lores elegidos (si la lista existe) — si tu sistema lo usa más adelante
    // Nota: aquí NO calculamos totales, solo tocamos buckets.
    if (Array.isArray(vocSpellLores) && Array.isArray(system.spellLores)) {
      for (const lore of system.spellLores) {
        if (!lore?.code) continue;
        if (vocSpellLores.includes(lore.code)) {
          lore.voc = this._toNumber(lore.voc, 0) + 10;
        }
      }
    }
  }

  /* -------------------------------------------- */
  /*  Derivados: Stats                            */
  /* -------------------------------------------- */

  _computeDerivedStats(system, derived) {
    const stats = system.stats;
    if (!stats) return;

    derived.stats = {};

    for (const [key, stat] of Object.entries(stats)) {
      const base = this._toNumber(stat.base);
      const kin = this._toNumber(stat.kin);
      const spec = this._toNumber(stat.spec);

      derived.stats[key] = { total: base + kin + spec };
    }
  }

  /* -------------------------------------------- */
  /*  Derivados: Skills                           */
  /* -------------------------------------------- */

  _computeDerivedSkills(system, derived) {
    if (!system.skills) return;

    derived.skills = {};

    for (const [catKey, category] of Object.entries(system.skills)) {
      const skills = category.skills ?? {};
      for (const [skillKey, skill] of Object.entries(skills)) {
        const statKey = skill.stat;
        const statTotal = this._toNumber(derived.stats?.[statKey]?.total, 0);

        const ranks = this._toNumber(skill.ranks, 0);
        const rankBonus = this.getRankBonus(ranks);

        const voc = this._toNumber(skill.voc, 0);
        const kin = this._toNumber(skill.kin, 0);
        const spec = this._toNumber(skill.spec, 0);
        const item = this._toNumber(skill.item, 0);

        derived.skills[skillKey] = {
          category: catKey,
          statKey: statKey || null,
          rankBonus,
          total: statTotal + rankBonus + voc + kin + spec + item,
        };
      }
    }
  }

  /* -------------------------------------------- */
  /*  Derivados: Spell Lores                      */
  /* -------------------------------------------- */

  _computeDerivedSpellLores(system, derived) {
    const lores = system.spellLores;
    if (!Array.isArray(lores)) return;

    derived.spellLores = [];

    for (const lore of lores) {
      if (!lore) continue;

      const statKey = lore.statKey || "wits";
      const statTotal = this._toNumber(derived.stats?.[statKey]?.total, 0);

      const ranks = this._toNumber(lore.ranks, 0);
      const rankBonus = this.getRankBonus(ranks);

      const voc = this._toNumber(lore.voc, 0);
      const kin = this._toNumber(lore.kin, 0);
      const spec = this._toNumber(lore.spec, 0);
      const item = this._toNumber(lore.item, 0);

      derived.spellLores.push({
        code: lore.code ?? "",
        name: lore.name ?? "",
        statKey,
        rankBonus,
        total: statTotal + rankBonus + voc + kin + spec + item,
        knownSpells: Array.isArray(lore.knownSpells) ? lore.knownSpells : [],
      });
    }
  }

  /* -------------------------------------------- */
  /*  Derivados: Saves / Wealth / Background      */
  /* -------------------------------------------- */
  _computeDerivedSaves(system, derived) {
    const saves = system.saves;
    if (!saves) return;

    const level = this._toNumber(system.identity?.level, 1);

    const fort = this._toNumber(derived.stats?.fortitude?.total, 0);
    const wis = this._toNumber(derived.stats?.wisdom?.total, 0);

    const kinTsr = this._toNumber(saves.kinTsr, 0);
    const specTsr = this._toNumber(saves.specTsr, 0);
    const itemTsr = this._toNumber(saves.itemTsr, 0);

    const kinWsr = this._toNumber(saves.kinWsr, 0);
    const specWsr = this._toNumber(saves.specWsr, 0);
    const itemWsr = this._toNumber(saves.itemWsr, 0);

    derived.saves = {
      tsr: fort + 5 * level + kinTsr + specTsr + itemTsr,
      wsr: wis + 5 * level + kinWsr + specWsr + itemWsr,
    };
  }

  _computeDerivedWealth(system, derived) {
    const wealth = system.wealth;
    if (!wealth) return;

    const base = this._toNumber(wealth.wealthLevel, 0);
    const kin = this._toNumber(derived.kin?.initialWealthLevel, 0);

    derived.wealth = {
      wealthLevel: base + kin,
      status: this._toNumber(wealth.status, 0),
    };
  }

  _computeDerivedBackgroundPoints(system, derived) {
    const bp = system.backgroundPoints;
    if (!bp) return;

    const base = this._toNumber(bp.total, 0);
    const kin = this._toNumber(derived.kin?.backgroundPoints, 0);

    derived.backgroundPoints = { total: base + kin };
  }

  /* -------------------------------------------- */
  /*  Derivados: Magic Points                     */
  /* -------------------------------------------- */

  _computeDerivedMagicPoints(system, derived) {
    const mp = system.magicPoints;
    if (!mp) return;

    const level = this._toNumber(system.identity?.level, 1);

    const vocationItem = this._getVocationItem();
    const vocSystem = vocationItem?.system ?? {};

    const magicStatKey = vocSystem.magicStatKey || "bearing";
    const magicStatTotal = this._toNumber(
      derived.stats?.[magicStatKey]?.total,
      0
    );

    const statGainPerLevel = Math.floor(magicStatTotal / 10);
    const magicStatBonus = level * statGainPerLevel;

    const mpPerLevel = this._toNumber(vocSystem.magicPointsPerLevel, 0);
    const vocationBonus = level * mpPerLevel;

    const kinBase = this._toNumber(mp.kinBase, 0);
    const specialBonus = this._toNumber(mp.specialBonus, 0);

    const total = kinBase + magicStatBonus + vocationBonus + specialBonus;

    derived.magicPoints = {
      total,
      breakdown: {
        kinBase,
        magicStatBonus,
        vocationBonus,
        specialBonus,
        magicStatKey,
        mpPerLevel,
      },
    };

    // Clamp current a total
    const current = this._toNumber(mp.current, 0);
    const clamped = Math.max(0, Math.min(current, total));
    if (clamped !== current) mp.current = clamped;
  }

  /* -------------------------------------------- */
  /*  Derivados: Hit Points                       */
  /* -------------------------------------------- */

  _computeDerivedHitPoints(system, derived) {
    const hp = system.hitPoints;
    if (!hp) return;

    // HP total = skill Body total
    // (skill key: "body"; category: "body")
    const bodyTotal = this._toNumber(derived.skills?.body?.total, 0);

    const maxBase = this._toNumber(hp.maxHitPoints, 0);
    const max =
      maxBase +
      this._toNumber(hp.backgroundBonus, 0) +
      this._toNumber(hp.itemBonus, 0) +
      this._toNumber(hp.specBonus, 0);

    const capacity = Math.min(bodyTotal, max);

    // Umbral: por defecto lo calculo sobre capacity para que respete el cap.
    // Si en VsD el bruiseThreshold depende del total “antes del cap”, cambia a bodyTotal.
    const bruiseThreshold = Math.floor(capacity / 2);

    derived.hitPoints = {
      total: bodyTotal,
      max,
      capacity,
      bruiseThreshold,
    };

    // Clamp current a capacity
    const current = this._toNumber(hp.current, 0);
    const clamped = Math.max(0, Math.min(current, capacity));
    if (clamped !== current) hp.current = clamped;
  }

  /* -------------------------------------------- */
  /*  Encumbrance & Movement                      */
  /* -------------------------------------------- */

  _computeDerivedEncumbranceAndMovement(system, derived) {
    // Encumbrance inputs se normalizan en reset, aquí solo calculamos rate
    const baseRate = this._toNumber(system.movement?.baseRate, 15);
    const penalty = this._toNumber(system.encumbrance?.penalty, 0);

    derived.movement = {
      rate: baseRate - penalty,
    };
  }

  /* -------------------------------------------- */
  /*  Datos para tiradas                          */
  /* -------------------------------------------- */

  getRollData2() {
    const data = super.getRollData ? super.getRollData() : {};
    return data;
  }

  getRollData() {
    return {
      ...super.getRollData(),
      ...(this.system.getRollData?.() ?? null),
    };
  }

  /* -------------------------------------------- */
  /*  Serialización auxiliar                      */
  /* -------------------------------------------- */

  toPlainObject() {
    const result = { ...this };
    result.system = this.system.toPlainObject();
    result.items = this.items?.size > 0 ? this.items.contents : [];
    result.effects = this.effects?.size > 0 ? this.effects.contents : [];
    return result;
  }
}
