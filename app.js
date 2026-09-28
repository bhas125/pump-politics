(() => {
  const MIN = 1.0;
  const MAX = 6.0;
  const DEMO_PRICE = 3.21;
  const SPIN_MS = 1500;
  const PIVOT = { x: 160, y: 170 };

  const ZONES = [
    {
      id: "green",
      min: 1.0,
      max: 2.5,
      label: "Green · Cheap gas vibes",
      headline: "Happy little days",
      answers: [
        {
          issue: "Happy little trees",
          line: "Plant one for a neighbor. There are no mistakes — only happy accidents in policy.",
        },
        {
          issue: "Kindness across the aisle",
          line: "A soft hello. A shared bench. Maybe we all go home feeling a little lighter.",
        },
        {
          issue: "Community gardens",
          line: "Dirt under the nails, tomatoes on the table. Gentle leadership smells like basil.",
        },
        {
          issue: "Quiet town halls",
          line: "Lower voices, warm coffee, room for every story. Calm is a virtue too.",
        },
        {
          issue: "National nap time",
          line: "Everyone's soft around the edges. Don't rush the clouds — they're beautiful.",
        },
      ],
    },
    {
      id: "yellow",
      min: 2.5,
      max: 3.0,
      label: "Yellow · Getting spicy",
      headline: "Taxes & culture",
      answers: [
        {
          issue: "Tax policy",
          line: "Credits, brackets, and who pays what — the spreadsheets are back on the stump.",
        },
        {
          issue: "Trans kids",
          line: "Parents, schools, and statehouses. Handle the debate with seriousness, not cable volume.",
        },
        {
          issue: "Family tax credits",
          line: "Child care, EITC, middle-class relief — pocketbook policy with a culture-war backdrop.",
        },
        {
          issue: "School board fights",
          line: "Curriculum and bathrooms become national airtime. Local races, national stakes.",
        },
        {
          issue: "IRS & fairness",
          line: "Audit capacity, loopholes, and who actually gets checked — classic yellow-zone messaging.",
        },
      ],
    },
    {
      id: "orange",
      min: 3.0,
      max: 3.5,
      label: "Orange · Voters are restless",
      headline: "Kitchen-table mode",
      answers: [
        {
          issue: "The economy",
          line: "Jobs, wages, and grocery receipts. Speak plainly; voters are already counting.",
        },
        {
          issue: "Crime",
          line: "Safe streets, clear consequences, real prevention — tough and practical, not theatrical.",
        },
        {
          issue: "Jobs, jobs, jobs",
          line: "Hiring, training, and keeping work local. Three syllables that still win rooms.",
        },
        {
          issue: "Border & budgets",
          line: "Order at the border, discipline in spending. Two pressures, one podium.",
        },
        {
          issue: "Inflation explainers",
          line: "Eggs, rent, and gallons — name the pain, then name the fix.",
        },
      ],
    },
    {
      id: "red",
      min: 3.5,
      max: 6.0,
      label: "Red · Panic at the pump",
      headline: "POCKETBOOK RAGE",
      answers: [
        {
          issue: "Higher Wages!",
          line: "PAYCHECK UP. BILLS DOWN. STOP NICKEL-AND-DIMING WORKING PEOPLE!",
        },
        {
          issue: "Lower Prices!",
          line: "GAS. GROCERIES. EVERYTHING. CUT THE COST OF LIVING — NOW!",
        },
        {
          issue: "Cheap Houses!",
          line: "BUILD THEM. SELL THEM. STOP LOCKING FAMILIES OUT OF A HOME!",
        },
        {
          issue: "Rental Assistance!",
          line: "RENT IS A WEAPON. HELP PEOPLE STAY HOUSED — THIS MONTH!",
        },
        {
          issue: "Cut Our Bills!",
          line: "UTILITIES. INSURANCE. THE PUMP. WE'RE BROKE AND WE'RE FURIOUS!",
        },
      ],
    },
  ];

  // Pool of short labels for the slot reel (zone answers + headlines)
  const SLOT_POOL = [];
  ZONES.forEach((z) => {
    SLOT_POOL.push({ text: z.headline, zone: z.id });
    z.answers.forEach((a) => SLOT_POOL.push({ text: a.issue, zone: z.id }));
  });

  const els = {
    priceDisplay: document.getElementById("priceDisplay"),
    asOf: document.getElementById("asOf"),
    zonePill: document.getElementById("zonePill"),
    needle: document.getElementById("needle"),
    ctaBtn: document.getElementById("ctaBtn"),
    result: document.getElementById("result"),
    resultZone: document.getElementById("resultZone"),
    resultHero: document.getElementById("resultHero"),
    resultHeroIssue: document.getElementById("resultHeroIssue"),
    resultHeroLine: document.getElementById("resultHeroLine"),
    resultMoreLabel: document.getElementById("resultMoreLabel"),
    resultList: document.getElementById("resultList"),
    ticks: document.getElementById("ticks"),
    modeLive: document.getElementById("modeLive"),
    modeSim: document.getElementById("modeSim"),
    simPanel: document.getElementById("simPanel"),
    simSlider: document.getElementById("simSlider"),
    simValue: document.getElementById("simValue"),
    slotMachine: document.getElementById("slotMachine"),
    slotReel: document.getElementById("slotReel"),
    slotHint: document.getElementById("slotHint"),
  };

  let mode = "live"; // 'live' | 'simulate'
  let livePrice = null;
  let liveAsOf = "";
  let liveOk = false;
  let simPrice = 3.25;
  let current = { price: null, zone: null };
  let spinning = false;
  let answersRevealed = false;
  let landedAnswer = null; // the featured answer from the last spin
  let spinTimer = null;

  function priceToAngle(price) {
    const clamped = Math.min(MAX, Math.max(MIN, price));
    const t = (clamped - MIN) / (MAX - MIN);
    // Semicircle: $1 → -90° (left), $3.50 → 0° (up), $6 → +90° (right)
    return -90 + t * 180;
  }

  function zoneFor(price) {
    if (price < 2.5) return ZONES[0];
    if (price < 3.0) return ZONES[1];
    if (price < 3.5) return ZONES[2];
    return ZONES[3];
  }

  function drawTicks() {
    const marks = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
    const cx = PIVOT.x,
      cy = PIVOT.y,
      rOuter = 131,
      rInner = 109;
    els.ticks.innerHTML = marks
      .map((p) => {
        const deg = priceToAngle(p);
        const theta = ((deg - 90) * Math.PI) / 180;
        const x1 = cx + rInner * Math.cos(theta);
        const y1 = cy + rInner * Math.sin(theta);
        const x2 = cx + rOuter * Math.cos(theta);
        const y2 = cy + rOuter * Math.sin(theta);
        return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
      })
      .join("");
  }

  /** Rotate needle around fixed SVG viewBox pivot (160, 170). */
  function setNeedle(price, animate) {
    const angle = priceToAngle(price);
    if (!animate) {
      els.needle.style.transition = "none";
      els.needle.style.transform = `rotate(${angle}deg)`;
      void els.needle.getBoundingClientRect();
      els.needle.style.transition = "";
      return;
    }
    els.needle.style.transform = `rotate(${angle}deg)`;
  }

  function formatPrice(price) {
    return `$${price.toFixed(2)} / gal`;
  }

  function hideAnswers() {
    answersRevealed = false;
    landedAnswer = null;
    els.result.hidden = true;
    els.resultList.innerHTML = "";
    els.resultZone.textContent = "";
    if (els.resultHeroIssue) els.resultHeroIssue.textContent = "";
    if (els.resultHeroLine) els.resultHeroLine.textContent = "";
  }

  function hideSlot() {
    els.slotMachine.hidden = true;
    els.slotMachine.classList.remove("spinning");
    els.slotReel.style.transition = "none";
    els.slotReel.style.transform = "translateY(0)";
    els.slotReel.innerHTML = "";
  }

  function applyDisplay(price, meta) {
    const zone = zoneFor(price);
    const zoneChanged = current.zone && current.zone.id !== zone.id;
    current = { price, zone };

    els.priceDisplay.textContent = formatPrice(price);
    els.asOf.textContent = meta.asOfText;
    els.zonePill.textContent = zone.label;
    els.zonePill.className = `zone-pill ${zone.id}${meta.error ? " error" : ""}`;

    if (meta.animateFromLeft) {
      els.needle.style.transition = "none";
      els.needle.style.transform = "rotate(-90deg)";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          els.needle.style.transition = "";
          setNeedle(price, true);
        });
      });
    } else {
      setNeedle(price, meta.animate !== false);
    }

    // If answers already revealed and zone still matches, keep landed hero + refresh secondaries.
    // If zone changed (e.g. sim drag), hide until user clicks again.
    if (answersRevealed && !spinning) {
      if (zoneChanged) {
        hideAnswers();
      } else {
        renderAnswers(true);
      }
    }
  }

  function renderAnswers(quiet) {
    if (!current.zone) return;
    const z = current.zone;
    answersRevealed = true;
    els.result.hidden = false;
    if (!quiet) {
      els.result.style.animation = "none";
      void els.result.offsetWidth;
      els.result.style.animation = "";
    }

    // Persist the landed answer as hero; fall back to first if missing
    const hero =
      landedAnswer && z.answers.some((a) => a.issue === landedAnswer.issue)
        ? landedAnswer
        : z.answers[0];
    landedAnswer = hero;

    els.resultZone.textContent = z.label;
    els.result.dataset.zone = z.id;
    els.resultHeroIssue.textContent = hero.issue;
    els.resultHeroLine.textContent = hero.line;

    const others = z.answers.filter((a) => a.issue !== hero.issue);
    els.resultMoreLabel.hidden = others.length === 0;
    els.resultList.innerHTML = others
      .map(
        (a) => `
      <li class="answer secondary">
        <div>
          <p class="answer-issue">${a.issue}</p>
          <p class="answer-line">${a.line}</p>
        </div>
      </li>`
      )
      .join("");
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildReel(finalItem) {
    // ~18 spinning items + final landing item
    const count = 18;
    const items = [];
    const pool = shuffle(SLOT_POOL);
    for (let i = 0; i < count; i++) {
      items.push(pool[i % pool.length]);
    }
    items.push(finalItem);
    return items;
  }

  function runSlotSpin() {
    if (spinning || !current.zone) return;
    spinning = true;
    hideAnswers();
    hideSlot();

    els.ctaBtn.disabled = true;
    els.ctaBtn.setAttribute("aria-busy", "true");

    const z = current.zone;
    // Land on one random answer from this zone — that becomes the hero
    const pick = z.answers[Math.floor(Math.random() * z.answers.length)];
    landedAnswer = pick;
    const finalItem = { text: pick.issue, zone: z.id };
    const items = buildReel(finalItem);
    const itemH = 56;

    els.slotReel.innerHTML = items
      .map((it) => `<div class="slot-item ${it.zone}">${it.text}</div>`)
      .join("");

    els.slotHint.textContent = "Spinning the issue wheel…";
    els.slotMachine.hidden = false;
    els.slotMachine.classList.add("spinning");

    // Start at top, then animate down to final item
    els.slotReel.style.transition = "none";
    els.slotReel.style.transform = "translateY(0)";
    void els.slotReel.offsetWidth;

    const finalIndex = items.length - 1;
    const targetY = -(finalIndex * itemH);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.slotReel.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.18, 1)`;
        els.slotReel.style.transform = `translateY(${targetY}px)`;
      });
    });

    if (spinTimer) clearTimeout(spinTimer);
    spinTimer = setTimeout(() => {
      spinning = false;
      els.slotMachine.classList.remove("spinning");
      els.slotHint.textContent = "Locked in.";
      els.ctaBtn.disabled = false;
      els.ctaBtn.removeAttribute("aria-busy");

      // Brief beat, then hide slot and reveal hero + secondary answers
      setTimeout(() => {
        hideSlot();
        renderAnswers(false);
      }, 280);
    }, SPIN_MS + 40);
  }

  function parseAaa(html) {
    const priceMatch =
      html.match(/National Average\s*\$([0-9]+(?:\.[0-9]+)?)/i) ||
      html.match(/Current Avg\.\s*\$([0-9]+(?:\.[0-9]+)?)/i);
    const dateMatch = html.match(/Price as of\s*([^<\n]+)/i);
    if (!priceMatch) return null;
    const price = parseFloat(priceMatch[1]);
    if (!Number.isFinite(price) || price < 0.5 || price > 20) return null;
    const asOfText = dateMatch
      ? `AAA US regular · as of ${dateMatch[1].trim()}`
      : "AAA US regular national average";
    return { price, asOfText };
  }

  async function fetchLivePrice() {
    els.zonePill.textContent = "Loading…";
    els.zonePill.className = "zone-pill loading";

    let lastErr = null;

    // 1) Same-origin /api/gas-price (local server.py or Vercel serverless)
    try {
      const res = await fetch("/api/gas-price", { cache: "no-store" });
      if (!res.ok) throw new Error(`API HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!Number.isFinite(data.price)) throw new Error("Bad API price");
      livePrice = data.price;
      liveAsOf = data.asOf
        ? `AAA US regular · as of ${data.asOf}`
        : "AAA US regular national average";
      liveOk = true;
      if (mode === "live") {
        applyDisplay(livePrice, { asOfText: liveAsOf, animateFromLeft: true });
      }
      return;
    } catch (err) {
      lastErr = err;
    }

    // 2) CORS proxy scrape of AAA (GitHub Pages / static hosts)
    const target = "https://gasprices.aaa.com/";
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`,
      `https://corsproxy.io/?${encodeURIComponent(target)}`,
    ];
    for (const url of proxies) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get("content-type") || "";
        let html;
        if (ct.includes("application/json") || url.includes("/get?")) {
          const data = await res.json();
          html = data.contents || data;
          if (typeof html !== "string") throw new Error("Bad proxy payload");
        } else {
          html = await res.text();
        }
        const parsed = parseAaa(html);
        if (!parsed) throw new Error("Could not parse AAA price");
        livePrice = parsed.price;
        liveAsOf = parsed.asOfText;
        liveOk = true;
        if (mode === "live") {
          applyDisplay(livePrice, { asOfText: liveAsOf, animateFromLeft: true });
        }
        return;
      } catch (err) {
        lastErr = err;
      }
    }

    livePrice = DEMO_PRICE;
    liveAsOf = `Demo price — live fetch failed (${lastErr ? lastErr.message : "unknown"})`;
    liveOk = false;
    if (mode === "live") {
      applyDisplay(livePrice, {
        asOfText: liveAsOf,
        animateFromLeft: true,
        error: true,
      });
    }
  }

  function setMode(next) {
    mode = next;
    const isSim = mode === "simulate";
    els.modeLive.classList.toggle("active", !isSim);
    els.modeSim.classList.toggle("active", isSim);
    els.modeLive.setAttribute("aria-pressed", String(!isSim));
    els.modeSim.setAttribute("aria-pressed", String(isSim));
    els.simPanel.hidden = !isSim;
    document.body.classList.toggle("simulate-on", isSim);

    // Mode switch resets answers until user clicks again
    if (!spinning) {
      hideSlot();
      hideAnswers();
    }

    if (isSim) {
      els.simSlider.value = String(simPrice);
      els.simValue.textContent = `$${simPrice.toFixed(2)}`;
      applyDisplay(simPrice, {
        asOfText: "PRETEND · Simulate mode — not live data",
        animate: true,
      });
    } else if (livePrice != null) {
      applyDisplay(livePrice, {
        asOfText: liveAsOf,
        animate: true,
        error: !liveOk,
      });
    } else {
      els.zonePill.textContent = "Loading…";
      els.zonePill.className = "zone-pill loading";
    }
  }

  // Expose for verification / screenshots
  window.__pumpPolitics = {
    priceToAngle,
    zoneFor,
    setNeedle,
    setSimPrice(p) {
      simPrice = p;
      setMode("simulate");
      applyDisplay(simPrice, {
        asOfText: "PRETEND · Simulate mode — not live data",
        animate: false,
      });
    },
    getAngle: () => priceToAngle(current.price),
    getNeedleTransform: () => els.needle.style.transform,
    ZONES,
  };

  els.ctaBtn.addEventListener("click", runSlotSpin);
  els.modeLive.addEventListener("click", () => setMode("live"));
  els.modeSim.addEventListener("click", () => setMode("simulate"));
  els.simSlider.addEventListener("input", () => {
    simPrice = parseFloat(els.simSlider.value);
    els.simValue.textContent = `$${simPrice.toFixed(2)}`;
    if (mode === "simulate") {
      applyDisplay(simPrice, {
        asOfText: "PRETEND · Simulate mode — not live data",
        animate: true,
      });
    }
  });

  drawTicks();
  // Initial needle at left ($1) until price loads — CSS rotate around fixed pivot
  els.needle.style.transform = "rotate(-90deg)";
  setMode("live");
  fetchLivePrice();
})();
