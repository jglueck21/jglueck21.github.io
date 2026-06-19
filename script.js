/* =============================================================
   Julian Glueck — portfolio interactions
   Vanilla JS. No dependencies.

   Modules:
   1.  Theme (light / dark) — localStorage + prefers-color-scheme
   2.  i18n (EN / DE / JA) — auto-detect + subtle hint + persist
   3.  Role rotator
   4.  Smooth in-page scroll
   5.  Nav scrolled-state + active-section highlight
   6.  Scroll reveal (staggered)
   7.  Mobile menu
   8.  Copy email
   9.  Avatar fallback
   10. Footer year
   ============================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ===========================================================
     1. THEME
     =========================================================== */
  var THEME_KEY = "theme";
  var themeToggle = document.getElementById("themeToggle");

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      // aria-pressed === true  ->  dark is active
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
  }

  // Initial theme: stored choice wins, else system preference.
  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {}
  applyTheme(storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : systemTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
    });
  }

  // Follow the OS if the user hasn't made an explicit choice.
  var sysScheme = window.matchMedia("(prefers-color-scheme: light)");
  var onSchemeChange = function () {
    var hasChoice = false;
    try {
      hasChoice = !!localStorage.getItem(THEME_KEY);
    } catch (e) {}
    if (!hasChoice) applyTheme(systemTheme());
  };
  if (sysScheme.addEventListener) {
    sysScheme.addEventListener("change", onSchemeChange);
  } else if (sysScheme.addListener) {
    sysScheme.addListener(onSchemeChange);
  }

  /* ===========================================================
     2. I18N
     =========================================================== */
  var LANG_KEY = "lang";
  // Languages shown in the picker — this array is the single source of truth.
  // Japanese is fully translated below but hidden for now. To switch it back on
  // once you're happy with your Japanese, just add "ja" back to this array;
  // the menu item and auto-detect will return automatically.
  var SUPPORTED = ["en", "de"];

  // Role rotator words, per language.
  var ROLES = {
    en: ["Cybersecurity", "Penetration Testing", "Secure Systems", "Cloud Security"],
    de: ["Cybersecurity", "Penetration Testing", "sichere Systeme", "Cloud-Security"],
    ja: ["サイバーセキュリティ", "ペネトレーションテスト", "セキュアなシステム", "クラウドセキュリティ"]
  };

  // Subtle hint shown only when the browser language differs from EN
  // and the visitor has not chosen a language yet. Worded in the target language.
  var HINT = {
    de: { text: "Diese Seite auf Deutsch ansehen?", accept: "Auf Deutsch" },
    ja: { text: "このサイトを日本語で表示しますか？", accept: "日本語で見る" }
  };

  var I18N = {
    en: {
      "nav.focus": "Focus",
      "nav.work": "Work",
      "nav.resume": "Résumé",
      "nav.about": "About",
      "nav.contact": "Contact",

      "hero.eyebrow": "Vienna, Austria · Cybersecurity & Software",
      "hero.sub_prefix": "Focused on",
      "hero.lede":
        "I don't just write code — I study how systems work, why they fail, and how to secure them. From shell scripting and Python to hands-on security labs, I'm always chasing the next problem worth solving.",
      "hero.cta_work": "View work",
      "hero.cta_resume": "Download résumé",

      "focus.label": "Focus",
      "focus.title": "Where I focus",
      "focus.desc":
        "Areas I'm building real depth in — security work, offensive testing, and the systems thinking behind both.",
      "focus.c1.title": "Security Assessment",
      "focus.c1.desc":
        "Finding weaknesses in websites, networks, and systems through careful, methodical analysis — then turning findings into clear, actionable fixes.",
      "focus.c2.title": "Penetration Testing",
      "focus.c2.desc":
        "Simulating real-world attacks against web apps and network setups to surface vulnerabilities before they can be exploited.",
      "focus.c3.title": "Secure Coding",
      "focus.c3.desc":
        "Writing and reviewing code with security in mind — from Python tooling to shell scripts built and tested in hands-on labs.",
      "focus.c4.title": "Systems & Networks",
      "focus.c4.desc":
        "Understanding how systems and networks actually work under the hood — the foundation for defending them.",

      "work.label": "Selected Work",
      "work.title": "Things I've built",
      "work.desc":
        "A few projects that show how I think — from product-style web apps to small security tools.",
      "work.p1.kind": "Web app",
      "work.p1.status": "Live",
      "work.p1.desc":
        "A sleek, web-based music player with a vinyl-style interface, interactive playlists, and the essentials — shuffle, loop, and cover art.",
      "work.p2.kind": "Security tool",
      "work.p2.status": "Open source",
      "work.p2.desc":
        "A small but effective Python port scanner that detects open TCP ports on a host. Inspired by tools like Nmap, it covers the fundamentals of network enumeration.",
      "work.ghost.title": "More on the way",
      "work.ghost.desc":
        "New security tools and projects are in progress. The latest always lands on GitHub first.",
      "work.ghost.link": "View GitHub",

      "resume.label": "Background",
      "resume.title": "Experience & education",
      "resume.desc": "Where I've worked and what I'm studying.",
      "resume.exp_label": "Experience",
      "resume.edu_label": "Education",
      "resume.skills_label": "Skills",
      "resume.e1.role": "Summer Intern — IT Hardware Management",
      "resume.e1.desc":
        "Returned for a second internship, deepening my hardware maintenance and support skills.",
      "resume.e2.role": "Summer Intern — IT Hardware Management",
      "resume.e2.desc": "Set up, supported, and maintained computer systems.",
      "resume.edu1.role": "Austrian Matura",
      "resume.edu1.desc":
        "IT-focused Austrian diploma covering programming, networking, and computer systems.",

      "about.label": "Profile",
      "about.title": "About me",
      "about.bio":
        "I'm a 17-year-old developer and cybersecurity student in Vienna, focused on how systems work, why they fail, and how to defend them. I learn by building — Python tooling, shell scripts, and hands-on labs — and I'm always after the next problem worth solving.",
      "about.status": "Open to internships & projects",
      "about.f.location": "Based in",
      "about.v.location": "Vienna, Austria",
      "about.f.age": "Age",
      "about.v.age": "17",
      "about.f.nationality": "Nationality",
      "about.v.nationality": "Austrian",
      "about.f.languages": "Languages",
      "about.v.languages": "English · German",
      //"about.v.languages": "English · German · Japanese (learning)",
      "about.f.availability": "Availability",
      "about.v.availability": "Internships & project work",
      "about.f.email": "Email",

      "contact.label": "Contact",
      "contact.title": "Let's work together",
      "contact.desc":
        "Whether it's a project, an internship, or just an idea worth exploring — I'm ready to contribute and learn. Let's build something solid.",
      "contact.copy": "Copy",
      "contact.copied": "Copied",

      "footer.built": "Designed & built in Vienna",
      "footer.top": "Back to top"
    },

    de: {
      "nav.focus": "Fokus",
      "nav.work": "Projekte",
      "nav.resume": "Werdegang",
      "nav.about": "Über mich",
      "nav.contact": "Kontakt",

      "hero.eyebrow": "Wien, Österreich · Cybersecurity & Software",
      "hero.sub_prefix": "Mit Fokus auf",
      "hero.lede":
        "Ich schreibe nicht einfach nur Code — ich untersuche, wie Systeme funktionieren, warum sie versagen und wie man sie absichert. Von Shell-Scripting und Python bis zu praxisnahen Security-Labs bin ich immer auf der Suche nach dem nächsten Problem, das sich zu lösen lohnt.",
      "hero.cta_work": "Projekte ansehen",
      "hero.cta_resume": "Lebenslauf herunterladen",

      "focus.label": "Fokus",
      "focus.title": "Meine Schwerpunkte",
      "focus.desc":
        "Bereiche, in denen ich echte Tiefe aufbaue — Security-Arbeit, offensives Testing und das Systemdenken dahinter.",
      "focus.c1.title": "Security-Analyse",
      "focus.c1.desc":
        "Schwachstellen in Websites, Netzwerken und Systemen durch sorgfältige, methodische Analyse aufspüren — und Erkenntnisse in klare, umsetzbare Maßnahmen verwandeln.",
      "focus.c2.title": "Penetration Testing",
      "focus.c2.desc":
        "Reale Angriffe auf Web-Apps und Netzwerkumgebungen simulieren, um Schwachstellen aufzudecken, bevor sie ausgenutzt werden können.",
      "focus.c3.title": "Sicheres Programmieren",
      "focus.c3.desc":
        "Code mit Sicherheit im Blick schreiben und prüfen — von Python-Tools bis zu Shell-Skripten, gebaut und getestet in praxisnahen Labs.",
      "focus.c4.title": "Systeme & Netzwerke",
      "focus.c4.desc":
        "Verstehen, wie Systeme und Netzwerke unter der Haube wirklich funktionieren — die Grundlage, um sie zu verteidigen.",

      "work.label": "Ausgewählte Projekte",
      "work.title": "Was ich gebaut habe",
      "work.desc":
        "Ein paar Projekte, die zeigen, wie ich denke — von produktnahen Web-Apps bis zu kleinen Security-Tools.",
      "work.p1.kind": "Web-App",
      "work.p1.status": "Live",
      "work.p1.desc":
        "Ein schlanker, webbasierter Musik-Player mit Vinyl-Optik, interaktiven Playlists und allem Wesentlichen — Shuffle, Loop und Cover-Art.",
      "work.p2.kind": "Security-Tool",
      "work.p2.status": "Open Source",
      "work.p2.desc":
        "Ein kleiner, aber effektiver Python-Portscanner, der offene TCP-Ports auf einem Host erkennt. Inspiriert von Tools wie Nmap, deckt er die Grundlagen der Netzwerk-Enumeration ab.",
      "work.ghost.title": "Mehr ist in Arbeit",
      "work.ghost.desc":
        "Neue Security-Tools und Projekte sind in Arbeit. Das Neueste landet immer zuerst auf GitHub.",
      "work.ghost.link": "GitHub ansehen",

      "resume.label": "Werdegang",
      "resume.title": "Erfahrung & Ausbildung",
      "resume.desc": "Wo ich gearbeitet habe und was ich gerade lerne.",
      "resume.exp_label": "Erfahrung",
      "resume.edu_label": "Ausbildung",
      "resume.skills_label": "Skills",
      "resume.e1.role": "Sommerpraktikum — IT-Hardware-Management",
      "resume.e1.desc":
        "Für ein zweites Praktikum zurückgekehrt und dabei meine Fähigkeiten in Hardware-Wartung und Support vertieft.",
      "resume.e2.role": "Sommerpraktikum — IT-Hardware-Management",
      "resume.e2.desc": "Computersysteme eingerichtet, betreut und gewartet.",
      "resume.edu1.role": "Matura",
      "resume.edu1.desc":
        "IT-orientierter österreichischer Abschluss mit Programmierung, Netzwerktechnik und Computersystemen.",

      "about.label": "Profil",
      "about.title": "Über mich",
      "about.bio":
        "Ich bin ein 17-jähriger Entwickler und Cybersecurity-Schüler aus Wien — fasziniert davon, wie Systeme funktionieren, warum sie versagen und wie man sie verteidigt. Ich lerne durchs Bauen — Python-Tools, Shell-Skripte und praxisnahe Labs — und bin immer auf der Suche nach dem nächsten Problem, das sich zu lösen lohnt.",
      "about.status": "Offen für Praktika & Projekte",
      "about.f.location": "Standort",
      "about.v.location": "Wien, Österreich",
      "about.f.age": "Alter",
      "about.v.age": "17",
      "about.f.nationality": "Nationalität",
      "about.v.nationality": "Österreichisch",
      "about.f.languages": "Sprachen",
      "about.v.languages": "Englisch · Deutsch",
      //"about.v.languages": "Englisch · Deutsch · Japanisch (im Aufbau)",
      "about.f.availability": "Verfügbarkeit",
      "about.v.availability": "Praktika & Projektarbeit",
      "about.f.email": "E-Mail",

      "contact.label": "Kontakt",
      "contact.title": "Lass uns zusammenarbeiten",
      "contact.desc":
        "Ob ein Projekt, ein Praktikum oder einfach eine Idee, die es wert ist, erkundet zu werden — ich bin bereit, beizutragen und zu lernen. Lass uns etwas Solides bauen.",
      "contact.copy": "Kopieren",
      "contact.copied": "Kopiert",

      "footer.built": "Entworfen & gebaut in Wien",
      "footer.top": "Nach oben"
    },

    ja: {
      "nav.focus": "フォーカス",
      "nav.work": "プロジェクト",
      "nav.resume": "経歴",
      "nav.about": "私について",
      "nav.contact": "コンタクト",

      "hero.eyebrow": "オーストリア・ウィーン · サイバーセキュリティ & ソフトウェア",
      "hero.sub_prefix": "注力分野：",
      "hero.lede":
        "ただコードを書くだけではなく、システムがどう動き、なぜ壊れ、どう守るのかを突き詰めています。シェルスクリプトやPythonから実践的なセキュリティラボまで、常に解く価値のある次の課題を追い求めています。",
      "hero.cta_work": "プロジェクトを見る",
      "hero.cta_resume": "履歴書をダウンロード",

      "focus.label": "フォーカス",
      "focus.title": "注力している分野",
      "focus.desc":
        "本気で深掘りしている分野です——セキュリティの実務、攻撃的なテスト、そしてその根底にあるシステム的な思考。",
      "focus.c1.title": "セキュリティ評価",
      "focus.c1.desc":
        "ウェブサイト、ネットワーク、システムの弱点を、丁寧で体系的な分析によって洗い出し、明確で実行可能な対策へと落とし込みます。",
      "focus.c2.title": "ペネトレーションテスト",
      "focus.c2.desc":
        "ウェブアプリやネットワーク構成に対して実際の攻撃を模擬し、悪用される前に脆弱性を明らかにします。",
      "focus.c3.title": "セキュアコーディング",
      "focus.c3.desc":
        "セキュリティを意識してコードを書き、レビューします——Pythonのツールから、実践的なラボで構築・検証したシェルスクリプトまで。",
      "focus.c4.title": "システムとネットワーク",
      "focus.c4.desc":
        "システムやネットワークが内部で実際にどう動いているのかを理解する——それが防御の土台になります。",

      "work.label": "主なプロジェクト",
      "work.title": "これまでに作ったもの",
      "work.desc":
        "私の考え方が伝わるいくつかのプロジェクト——プロダクト志向のウェブアプリから、小さなセキュリティツールまで。",
      "work.p1.kind": "Webアプリ",
      "work.p1.status": "公開中",
      "work.p1.desc":
        "ヴァイナル風のインターフェースを備えた、洗練されたウェブベースの音楽プレーヤー。インタラクティブなプレイリストに加え、シャッフル・ループ・カバーアートといった基本もそろっています。",
      "work.p2.kind": "セキュリティツール",
      "work.p2.status": "オープンソース",
      "work.p2.desc":
        "ホスト上の開いているTCPポートを検出する、小さくても実用的なPython製ポートスキャナー。Nmapのようなツールに着想を得て、ネットワーク列挙の基本を押さえています。",
      "work.ghost.title": "続々と制作中",
      "work.ghost.desc":
        "新しいセキュリティツールやプロジェクトを制作中です。最新のものはいつもGitHubに最初に上がります。",
      "work.ghost.link": "GitHubを見る",

      "resume.label": "経歴",
      "resume.title": "経験と学歴",
      "resume.desc": "これまで働いてきた場所と、今学んでいること。",
      "resume.exp_label": "経験",
      "resume.edu_label": "学歴",
      "resume.skills_label": "スキル",
      "resume.e1.role": "サマーインターン — ITハードウェア管理",
      "resume.e1.desc":
        "2度目のインターンとして戻り、ハードウェアの保守とサポートのスキルをさらに深めました。",
      "resume.e2.role": "サマーインターン — ITハードウェア管理",
      "resume.e2.desc": "コンピューターシステムのセットアップ、サポート、保守を担当しました。",
      "resume.edu1.role": "オーストリア・マトゥーラ",
      "resume.edu1.desc":
        "プログラミング、ネットワーク、コンピューターシステムを扱う、IT重視のオーストリアの卒業資格。",

      "about.label": "プロフィール",
      "about.title": "私について",
      "about.bio":
        "ウィーンを拠点とする17歳の開発者であり、サイバーセキュリティを学ぶ学生です。システムがどう動き、なぜ壊れ、どう守るのかに夢中になっています。Pythonのツール、シェルスクリプト、実践的なラボなど、手を動かしながら学び、常に解く価値のある次の課題を探しています。",
      "about.status": "インターン・プロジェクトを募集中",
      "about.f.location": "拠点",
      "about.v.location": "オーストリア・ウィーン",
      "about.f.age": "年齢",
      "about.v.age": "17歳",
      "about.f.nationality": "国籍",
      "about.v.nationality": "オーストリア",
      "about.f.languages": "言語",
      "about.v.languages": "英語・ドイツ語・日本語（学習中）",
      "about.f.availability": "稼働状況",
      "about.v.availability": "インターン・プロジェクト",
      "about.f.email": "メール",

      "contact.label": "コンタクト",
      "contact.title": "一緒に取り組みましょう",
      "contact.desc":
        "プロジェクトでも、インターンでも、探求する価値のあるアイデアでも——貢献し、学ぶ準備はできています。しっかりとしたものを一緒に作りましょう。",
      "contact.copy": "コピー",
      "contact.copied": "コピーしました",

      "footer.built": "ウィーンでデザイン・制作",
      "footer.top": "トップへ戻る"
    }
  };

  var i18nNodes = document.querySelectorAll("[data-i18n]");
  var langCurrent = document.getElementById("langCurrent");
  var langItems = document.querySelectorAll("#langMenu li[data-lang]");
  var currentLang = "en";

  function t(key, lang) {
    var table = I18N[lang] || I18N.en;
    return table[key] != null ? table[key] : I18N.en[key];
  }

  function setLanguage(lang, persist) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "en";
    currentLang = lang;

    // Swap every translatable node.
    for (var i = 0; i < i18nNodes.length; i++) {
      var node = i18nNodes[i];
      var val = t(node.getAttribute("data-i18n"), lang);
      if (val != null) node.textContent = val;
    }

    // Document language + compact label.
    root.setAttribute("lang", lang);
    if (langCurrent) langCurrent.textContent = lang.toUpperCase();

    // Selected state in the dropdown.
    for (var j = 0; j < langItems.length; j++) {
      var li = langItems[j];
      li.setAttribute(
        "aria-selected",
        li.getAttribute("data-lang") === lang ? "true" : "false"
      );
    }

    // Keep the rotator in sync (and reset to the first word).
    setRoles(ROLES[lang] || ROLES.en);

    if (persist) {
      try {
        localStorage.setItem(LANG_KEY, lang);
      } catch (e) {}
    }
  }

  // Wire dropdown option clicks.
  for (var li = 0; li < langItems.length; li++) {
    (function (item) {
      item.addEventListener("click", function () {
        setLanguage(item.getAttribute("data-lang"), true);
        closeLangMenu();
        hideHint();
      });
    })(langItems[li]);
  }

  // Hide any language that isn't enabled in SUPPORTED. The markup and
  // translations stay in place, so re-enabling is just an array change.
  for (var hideI = 0; hideI < langItems.length; hideI++) {
    langItems[hideI].hidden =
      SUPPORTED.indexOf(langItems[hideI].getAttribute("data-lang")) === -1;
  }

  /* ---- Language dropdown open / close ---- */
  var lang = document.getElementById("lang");
  var langBtn = document.getElementById("langBtn");

  function openLangMenu() {
    if (!lang) return;
    lang.classList.add("is-open");
    if (langBtn) langBtn.setAttribute("aria-expanded", "true");
  }
  function closeLangMenu() {
    if (!lang) return;
    lang.classList.remove("is-open");
    if (langBtn) langBtn.setAttribute("aria-expanded", "false");
  }
  if (langBtn) {
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (lang.classList.contains("is-open")) closeLangMenu();
      else openLangMenu();
    });
  }
  document.addEventListener("click", function (e) {
    if (lang && lang.classList.contains("is-open") && !lang.contains(e.target)) {
      closeLangMenu();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLangMenu();
  });

  /* ---- Subtle language hint (first visit only) ---- */
  var hintEl = document.getElementById("langHint");
  var hintText = document.getElementById("langHintText");
  var hintAccept = document.getElementById("langHintAccept");
  var hintDismiss = document.getElementById("langHintDismiss");
  var hintTimer = null;

  function showHint(targetLang) {
    if (!hintEl || !HINT[targetLang]) return;
    if (hintText) hintText.textContent = HINT[targetLang].text;
    if (hintAccept) hintAccept.textContent = HINT[targetLang].accept;
    hintEl.hidden = false;
    // next frame so the transition runs
    requestAnimationFrame(function () {
      hintEl.classList.add("is-visible");
    });
    if (hintAccept) {
      hintAccept.onclick = function () {
        setLanguage(targetLang, true);
        hideHint();
      };
    }
    // Auto-dismiss after a while so it never lingers.
    hintTimer = window.setTimeout(hideHint, 9000);
  }
  function hideHint() {
    if (!hintEl) return;
    if (hintTimer) {
      clearTimeout(hintTimer);
      hintTimer = null;
    }
    hintEl.classList.remove("is-visible");
    window.setTimeout(function () {
      hintEl.hidden = true;
    }, 300);
  }
  if (hintDismiss) hintDismiss.addEventListener("click", hideHint);

  /* ---- Decide initial language ---- */
  (function initLanguage() {
    var stored = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch (e) {}

    if (stored && SUPPORTED.indexOf(stored) !== -1) {
      // Explicit prior choice always wins — no hint.
      setLanguage(stored, false);
      return;
    }

    // No choice yet: render English, but detect the browser language.
    var nav = (navigator.language || navigator.userLanguage || "en")
      .slice(0, 2)
      .toLowerCase();

    setLanguage("en", false);

    if (SUPPORTED.indexOf(nav) !== -1 && HINT[nav]) {
      // Offer — don't force — the detected language, but only if it's enabled.
      showHint(nav);
    }
  })();

  /* ===========================================================
     3. ROLE ROTATOR
     =========================================================== */
  var rotator = document.getElementById("rotator");
  var rotWords = ROLES.en;
  var rotIndex = 0;
  var rotTimer = null;

  function setRoles(words) {
    rotWords = words && words.length ? words : ROLES.en;
    rotIndex = 0;
    if (!rotator) return;
    var word = rotator.querySelector(".rotator__word");
    if (word) word.textContent = rotWords[0];
  }

  function cycleRole() {
    if (!rotator) return;
    var word = rotator.querySelector(".rotator__word");
    if (!word) return;

    word.classList.add("is-out");
    window.setTimeout(function () {
      rotIndex = (rotIndex + 1) % rotWords.length;
      word.textContent = rotWords[rotIndex];
      word.classList.remove("is-out");
    }, 450); // matches the CSS rot-out duration
  }

  if (rotator && !reduceMotion) {
    rotTimer = window.setInterval(cycleRole, 2600);
  }

  /* ===========================================================
     4. SMOOTH IN-PAGE SCROLL
     =========================================================== */
  var navEl = document.getElementById("nav");

  function navOffset() {
    return navEl ? navEl.offsetHeight + 12 : 0;
  }

  function scrollToId(id) {
    var target = document.getElementById(id);
    if (!target) return;
    var top =
      target.getBoundingClientRect().top + window.pageYOffset - navOffset();
    window.scrollTo({
      top: top,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  }

  var anchorLinks = document.querySelectorAll('a[href^="#"]');
  for (var a = 0; a < anchorLinks.length; a++) {
    anchorLinks[a].addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (!href || href === "#") return;
      var id = href.slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      scrollToId(id);
      closeMobileMenu();
      // Update the address bar without an extra jump.
      if (history.replaceState) history.replaceState(null, "", href);
    });
  }

  /* ===========================================================
     5. NAV: scrolled-state + active section
     =========================================================== */
  function onScroll() {
    if (navEl) {
      if (window.pageYOffset > 10) navEl.classList.add("is-scrolled");
      else navEl.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Map section id -> nav link, then highlight the one in view.
  var navLinks = document.querySelectorAll(".nav__link");
  var linkById = {};
  for (var n = 0; n < navLinks.length; n++) {
    var hrefN = navLinks[n].getAttribute("href");
    if (hrefN && hrefN.charAt(0) === "#") linkById[hrefN.slice(1)] = navLinks[n];
  }
  var watched = [];
  for (var key in linkById) {
    if (linkById.hasOwnProperty(key)) {
      var sec = document.getElementById(key);
      if (sec) watched.push(sec);
    }
  }

  function setActiveLink(id) {
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].classList.remove("is-active");
    }
    if (linkById[id]) linkById[id].classList.add("is-active");
  }

  if ("IntersectionObserver" in window && watched.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        // Pick the most prominent intersecting section.
        var best = null;
        for (var i = 0; i < entries.length; i++) {
          var en = entries[i];
          if (en.isIntersecting) {
            if (!best || en.intersectionRatio > best.intersectionRatio) {
              best = en;
            }
          }
        }
        if (best) setActiveLink(best.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    for (var w = 0; w < watched.length; w++) spy.observe(watched[w]);
  }

  /* ===========================================================
     6. SCROLL REVEAL (staggered)
     =========================================================== */
  var reveals = document.querySelectorAll(".reveal");

  if (reduceMotion) {
    // Reduced motion: everything is visible immediately (CSS also enforces this).
    for (var r0 = 0; r0 < reveals.length; r0++) {
      reveals[r0].classList.add("is-visible");
    }
  } else if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add("is-visible");
            obs.unobserve(entries[i].target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    for (var r1 = 0; r1 < reveals.length; r1++) {
      revealObserver.observe(reveals[r1]);
    }
  } else {
    for (var r2 = 0; r2 < reveals.length; r2++) {
      reveals[r2].classList.add("is-visible");
    }
  }

  // Hero items stagger in on load via their data-rv order.
  (function revealHero() {
    var heroItems = document.querySelectorAll(".hero [data-rv]");
    if (!heroItems.length) return;
    if (reduceMotion) {
      for (var i = 0; i < heroItems.length; i++) {
        heroItems[i].classList.add("is-visible");
      }
      return;
    }
    for (var k = 0; k < heroItems.length; k++) {
      var step = parseInt(heroItems[k].getAttribute("data-rv"), 10) || 0;
      heroItems[k].style.setProperty("--rv-delay", 90 * step + "ms");
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        for (var m = 0; m < heroItems.length; m++) {
          heroItems[m].classList.add("is-visible");
        }
      });
    });
  })();

  /* ===========================================================
     7. MOBILE MENU
     =========================================================== */
  var burger = document.getElementById("burger");
  var navLinksWrap = document.getElementById("navLinks");

  function closeMobileMenu() {
    if (navLinksWrap) navLinksWrap.classList.remove("is-open");
    if (burger) {
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  }
  if (burger && navLinksWrap) {
    burger.addEventListener("click", function () {
      var open = navLinksWrap.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  /* ===========================================================
     8. COPY EMAIL
     =========================================================== */
  var emailCopy = document.getElementById("emailCopy");
  var copyTimer = null;

  if (emailCopy) {
    var hintSpan = emailCopy.querySelector(".email-copy__hint");
    emailCopy.addEventListener("click", function () {
      var email = emailCopy.getAttribute("data-email") || "";

      var done = function () {
        emailCopy.classList.add("is-copied");
        if (hintSpan) hintSpan.textContent = t("contact.copied", currentLang);
        if (copyTimer) clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () {
          emailCopy.classList.remove("is-copied");
          if (hintSpan) hintSpan.textContent = t("contact.copy", currentLang);
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        try {
          var ta = document.createElement("textarea");
          ta.value = email;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        } catch (e) {}
      }
    });
  }

  /* ===========================================================
     9. AVATAR FALLBACK
     =========================================================== */
  var avatar = document.getElementById("avatar");
  var avatarImg = document.getElementById("avatarImg");
  if (avatarImg && avatar) {
    var markNoImg = function () {
      avatar.classList.add("no-img");
    };
    avatarImg.addEventListener("error", markNoImg);
    // Already failed before the listener attached?
    if (avatarImg.complete && avatarImg.naturalWidth === 0) markNoImg();
  }

  /* ===========================================================
     10. FOOTER YEAR
     =========================================================== */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();