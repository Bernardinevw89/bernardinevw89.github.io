(() => {
  const root = document.getElementById("br-store"),
    q = (s) => root.querySelector(s),
    qa = (s) => Array.from(root.querySelectorAll(s));
  q(".compare input").oninput = (e) => {
    q(".frame").style.setProperty("--split", e.target.value + "%");
    e.target.setAttribute("aria-valuetext", e.target.value + " percent design");
  };
  q(".pin").onclick = (e) => {
    const panel = q(".inspection");
    panel.hidden = !panel.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
    e.currentTarget.textContent = panel.hidden ? "+" : "−";
  };
  q(".viewKit").onclick = () => {
    if (!q(".bag").hidden) q(".bag .dismiss").click();
    q(".head").scrollIntoView({ block: "start" });
    q(".cart").click();
  };
  const families = {
    Flow: [
      ["Flow", "flow", "https://themes.shopify.com/themes/flow/presets/flow"],
      [
        "Grain",
        "grain",
        "https://themes.shopify.com/themes/flow/presets/grain",
      ],
      [
        "Timeless",
        "timeless",
        "https://themes.shopify.com/themes/flow/presets/timeless",
      ],
      [
        "Nectar",
        "nectar",
        "https://themes.shopify.com/themes/flow/presets/nectar",
      ],
      [
        "Sanctuary",
        "sanctuary",
        "https://themes.shopify.com/themes/flow/presets/sanctuary",
      ],
    ],
    Envy: [
      ["Envy", "envy", "https://themes.shopify.com/themes/envy/presets/envy"],
      [
        "Court",
        "court",
        "https://themes.shopify.com/themes/envy/presets/court",
      ],
      [
        "Enamel",
        "enamel",
        "https://themes.shopify.com/themes/envy/presets/enamel",
      ],
      [
        "Graft",
        "graft",
        "https://themes.shopify.com/themes/envy/presets/graft",
      ],
      [
        "Pedal",
        "pedal",
        "https://themes.shopify.com/themes/envy/presets/pedal",
      ],
    ],
    Capital: [
      [
        "Capital",
        "capital",
        "https://themes.shopify.com/themes/capital/presets/capital",
      ],
      [
        "Nice Try",
        "nice-try",
        "https://themes.shopify.com/themes/capital/presets/nice-try",
      ],
      [
        "Face Value",
        "face-value",
        "https://themes.shopify.com/themes/capital/presets/face-value",
      ],
      [
        "Mint",
        "mint",
        "https://themes.shopify.com/themes/capital/presets/mint",
      ],
      [
        "Off Lead",
        "off-lead",
        "https://themes.shopify.com/themes/capital/presets/off-lead",
      ],
    ],
    Halftone: [
      [
        "Halftone",
        "halftone",
        "https://themes.shopify.com/themes/halftone/presets/halftone",
      ],
      [
        "Pocket",
        "pocket",
        "https://themes.shopify.com/themes/halftone/presets/pocket",
      ],
      [
        "B Side",
        "b-side",
        "https://themes.shopify.com/themes/halftone/presets/b-side",
      ],
      [
        "Gacha",
        "gacha",
        "https://themes.shopify.com/themes/halftone/presets/gacha",
      ],
      [
        "Zine",
        "zine",
        "https://themes.shopify.com/themes/halftone/presets/zine",
      ],
    ],
  };
  const entries = [
      [
        "Tracing the wrong variant",
        "I started in technical support. Before asking for access, I opened the merchant\u2019s storefront and followed their steps. Tracing the behaviour helped me work out whether the theme needed a fix or an app developer needed a clear reproduction.",
        "Help Scout \u00b7 Storefront inspection",
      ],
      [
        "A fix the merchant can preview",
        "When support began escalating tickets to me, I investigated on a duplicate theme. The merchant got a preview they could test and publish in their own time. I turned repeat fixes into Notion tutorials and filed GitHub issues so the underlying bug could be addressed for future installs.",
        "Trello \u00b7 Liquid \u00b7 Notion \u00b7 GitHub",
      ],
      [
        "From Figma to Liquid",
        "I built sections and features from Figma, contributed to complete theme builds, and took sprint tickets through testing and lead review. I also onboarded new developers and kept handling escalations alongside planned work.",
        "Liquid \u00b7 HTML \u00b7 CSS \u00b7 JavaScript \u00b7 Figma \u00b7 Git",
      ],
      [
        "From support to app development",
        "I learned React by building an internal practice app from scratch. Then I spent several months contributing sprint work to Kitenzo, a bundle-building app I already knew from supporting its merchants.",
        "React foundations \u00b7 App development \u00b7 Sprint delivery",
      ],
      [
        "Reviewing a theme change",
        "Back on themes, I helped modernise existing products and tested both my own work and my teammate\u2019s. When our workflow shifted to Claude Code, I reviewed generated implementations for code quality and checked the storefront against the requirements.",
        "Peer QA \u00b7 Code review \u00b7 AI-assisted development",
      ],
    ],
    samples = [
      [
        "Storefront inspection",
        "Variant mismatch \u00b7 Illustration",
        "Shopper selected",
        "Clay",
        "Cart line item",
        "Moss",
      ],
      [
        "Theme library",
        "Merchant handoff \u00b7 Illustration",
        "Storefront",
        "Published",
        "Storefront copy",
        "Ready to preview",
      ],
      ["flow", "Flow \u00b7 Theme preview"],
      ["bundle-builder", "Kitenzo \u00b7 App preview"],
      [
        "Peer QA",
        "Narrow layout \u00b7 Illustration",
        "Before the fix",
        "Quick buy overflows",
        "After the fix",
        "Actions wrap",
      ],
    ];
  function chapter(i) {
    const [title, body, tools] = entries[i],
      sample = samples[i],
      box = q(".object");
    box.replaceChildren();
    box.classList.toggle("photo", sample.length === 2);
    if (sample.length === 2) {
      const img = document.createElement("img");
      img.src = `assets/${sample[0]}.webp`;
      img.alt = sample[1];
      box.append(img);
    } else {
      const slip = document.createElement("div");
      slip.className = "slip";
      const h = document.createElement("header");
      h.textContent = sample[0];
      slip.append(h);
      for (const j of [2, 4]) {
        const row = document.createElement("div"),
          key = document.createElement("span"),
          value = document.createElement("strong");
        key.textContent = sample[j];
        value.textContent = sample[j + 1];
        row.append(key, value);
        slip.append(row);
      }
      box.append(slip);
    }
    q(".exhibit figcaption").textContent = sample[1];
    q(".ed-copy h3").textContent = title;
    q(".ed-copy p").textContent = body;
    q(".ed-copy small").textContent = tools;
    qa(".ed-list button").forEach((b, j) =>
      b.setAttribute("aria-pressed", String(i === j)),
    );
  }
  qa(".ed-list button").forEach((b, i) => (b.onclick = () => chapter(i)));
  chapter(2);
  const menu = q(".mega"),
    bag = q(".bag"),
    cart = q(".cart");
  let opener;
  function close(restore = false) {
    menu.hidden = bag.hidden = true;
    qa(".head [aria-expanded]").forEach((b) =>
      b.setAttribute("aria-expanded", "false"),
    );
    if (restore && opener) opener.focus();
  }
  function openFamily(b) {
    const name = b.dataset.family,
      nav = qa(".links button").find((n) => n.dataset.family === name),
      toggle =
        !menu.hidden &&
        nav.getAttribute("aria-expanded") === "true" &&
        opener === b;
    close();
    if (toggle) return;
    opener = b;
    nav.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    q(".menuTitle").textContent = name + " presets";
    q(".menuTiles").replaceChildren(
      ...families[name].map(([label, slug, url]) => {
        const a = document.createElement("a"),
          i = document.createElement("img");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        i.src = `assets/${slug}.webp`;
        i.alt = "";
        a.append(i, label + " ↗");
        return a;
      }),
    );
    if (!b.closest("nav")) {
      q(".head").scrollIntoView({ block: "start" });
      q(".menuTiles a").focus();
    }
  }
  qa("[data-family]").forEach((b) => (b.onclick = () => openFamily(b)));
  cart.onclick = () => {
    const open = bag.hidden;
    close();
    if (open) {
      opener = cart;
      cart.setAttribute("aria-expanded", "true");
      bag.hidden = false;
      q(".bag .dismiss").focus();
    }
  };
  qa(".dismiss").forEach((b) => (b.onclick = () => close(true)));
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (!menu.hidden || !bag.hidden)) close(true);
  });
  document.addEventListener("pointerdown", (e) => {
    if (!q(".head").contains(e.target) && !e.target.closest("[data-family]"))
      close();
  });
  q(".pause").onclick = (e) => {
    let paused = q(".ribbon").classList.toggle("paused");
    e.currentTarget.textContent = paused ? "▷" : "Ⅱ";
    e.currentTarget.setAttribute(
      "aria-label",
      (paused ? "Resume" : "Pause") + " skills marquee",
    );
  };
})();
