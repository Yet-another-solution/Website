/**
 * UI string catalogue for the site's two languages.
 *
 * English is the default locale and is served from the site root (`/about/`),
 * Slovak from a `/sk/` prefix (`/sk/about/`) — see `routing.prefixDefaultLocale`
 * in astro.config.mjs. Every user-visible string that isn't page content lives
 * here so a missing translation is a type error rather than an English string
 * leaking into the Slovak site.
 */

export const languages = {
  en: 'EN',
  sk: 'SK',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

/** Long-form names, used for the switcher's title/aria text and hreflang UI. */
export const languageNames: Record<Lang, string> = {
  en: 'English',
  sk: 'Slovenčina',
};

/** BCP 47 tags for `<html lang>`, `hreflang`, and date formatting. */
export const localeTags: Record<Lang, string> = {
  en: 'en',
  sk: 'sk-SK',
};

/** `og:locale` values. */
export const ogLocales: Record<Lang, string> = {
  en: 'en_US',
  sk: 'sk_SK',
};

export const ui = {
  en: {
    // --- Navigation & chrome -------------------------------------------
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'nav.homeAria': 'Y-A-S Homepage',
    'nav.toggle': 'Toggle navigation',
    'nav.language': 'Change language',

    'site.description':
      'Yet Another Solution - A team of developers creating innovative software solutions using C#, Blazor, and PostgreSQL.',

    'footer.navigation': 'Navigation',
    'footer.team': 'The Team',
    'footer.builtWith': 'Built with Astro & hosted on Cloudflare Pages.',

    // --- Home: hero -----------------------------------------------------
    'home.hero.projectsTitle': 'See our projects',
    'home.hero.blogTitle': 'Read our blog',
    'home.hero.scrollTitle': 'Scroll down',

    // --- Home: intro ----------------------------------------------------
    'home.intro.label': 'Yet Another Solution',
    'home.intro.heading': 'We build software',
    'home.intro.body':
      'A team of developers crafting full-stack applications with modern tools — from backend APIs to polished web interfaces.',
    'home.intro.techAlt': 'Technology stack: C#, Blazor, PostgreSQL, GitHub',
    'home.intro.viewProjects': 'View Projects',
    'home.intro.contactUs': 'Contact Us',

    // --- Home: why ------------------------------------------------------
    'home.why.label': 'Why Y-A-S',
    'home.why.heading': 'Small team, real ownership.',
    'home.why.body':
      'No hand-offs between account managers and engineers — you talk directly to the people writing your code. We pick boring, reliable technology so your product stays maintainable long after launch.',

    // --- Home: how we work ----------------------------------------------
    'home.how.label': 'How We Work',
    'home.how.heading': 'From idea to shipped.',
    'home.how.body':
      'We move in small, focused iterations — spec, build, review, ship. Every project gets a clear architecture, tested code, and documentation your team can actually use.',
    'home.how.discovery': 'Discovery',
    'home.how.build': 'Build',
    'home.how.review': 'Review',
    'home.how.ship': 'Ship',

    // --- Home: selected work ---------------------------------------------
    'home.work.label': 'Selected Work',
    'home.work.heading': "Things we've shipped.",
    'home.work.body':
      'Open-source libraries, hackathons and community platforms — built and run by the team.',
    'home.work.viewAll': 'View all projects',

    // --- Home: blog CTA ---------------------------------------------------
    'home.blog.label': 'From the team',
    'home.blog.heading': 'Read our Blog',
    'home.blog.body':
      'Tutorials and deep dives on Blazor, .NET, and the way we build software.',
    'home.blog.explore': 'Explore Blog',

    // --- Scene labels (drawn into the WebGL diagrams) ----------------------
    'scene.you': 'You',
    'scene.developers': 'the developers',
    'scene.accountManager': 'account manager',
    'scene.noHandoffs': 'no hand-offs',

    // --- Blog -------------------------------------------------------------
    'blog.title': 'Blog',
    'blog.description':
      'Insights, tutorials, and thoughts on software development from the Y-A-S team.',
    'blog.browseTags': 'Browse by Tags:',
    'blog.browseSeries': 'Browse by Series:',
    'blog.readMore': 'Read More →',
    'blog.by': 'by',
    'blog.empty': 'No posts yet — check back soon.',
    'blog.backToBlog': 'Back to Blog',
    'blog.published': 'Published',
    'blog.author': 'Author',
    'blog.tags': 'Tags:',
    'blog.series': 'Series:',
    'blog.seriesNav': 'Series Navigation',
    'blog.progress': 'Progress:',
    // Wrap around the linked series name: "Part 1 of <Blazor Fundamentals> series".
    'blog.seriesPartBefore': 'Part {order} of',
    'blog.seriesPartAfter': 'series',
    'blog.tagPrefix': 'Tag:',
    'blog.taggedWith': 'Posts tagged with',
    'blog.seriesAllPosts': 'All posts in the {series} series',

    // --- Projects ---------------------------------------------------------
    'projects.title': 'Projects',
    'projects.description':
      'Explore projects built by the Y-A-S team using C#, Blazor, and more.',
    'projects.details': 'Project Details',
    'projects.technologies': 'Technologies:',
    'projects.date': 'Date:',
    'projects.visitPage': 'Visit Page',
    'projects.githubRepo': 'GitHub Repository',
    'projects.back': '← Back to Projects',
    'projects.learnMore': 'Learn More',

    // --- Contact -----------------------------------------------------------
    'contact.title': 'Contact',
    'contact.description': 'Get in touch with the Y-A-S team.',
    'contact.heading': 'Get in Touch',
    'contact.body':
      "The best way to reach us is through GitHub. We're always open to collaboration, questions, and feedback.",
    'contact.github': 'GitHub:',
    'contact.closing': 'Looking forward to connecting with you.',
  },

  sk: {
    // --- Navigácia a rámec -------------------------------------------------
    'nav.home': 'Domov',
    'nav.blog': 'Blog',
    'nav.projects': 'Projekty',
    'nav.contact': 'Kontakt',
    'nav.homeAria': 'Domovská stránka Y-A-S',
    'nav.toggle': 'Prepnúť navigáciu',
    'nav.language': 'Zmeniť jazyk',

    'site.description':
      'Yet Another Solution – tím vývojárov, ktorý tvorí inovatívne softvérové riešenia v C#, Blazore a PostgreSQL.',

    'footer.navigation': 'Navigácia',
    'footer.team': 'Tím',
    'footer.builtWith': 'Postavené v Astre a hostované na Cloudflare Pages.',

    // --- Domov: hero --------------------------------------------------------
    'home.hero.projectsTitle': 'Pozrite si naše projekty',
    'home.hero.blogTitle': 'Prečítajte si náš blog',
    'home.hero.scrollTitle': 'Posunúť nadol',

    // --- Domov: úvod --------------------------------------------------------
    'home.intro.label': 'Yet Another Solution',
    'home.intro.heading': 'Tvoríme softvér',
    'home.intro.body':
      'Tím vývojárov, ktorý stavia full-stack aplikácie s modernými nástrojmi — od backendových API až po vyladené webové rozhrania.',
    'home.intro.techAlt': 'Technologický stack: C#, Blazor, PostgreSQL, GitHub',
    'home.intro.viewProjects': 'Zobraziť projekty',
    'home.intro.contactUs': 'Kontaktujte nás',

    // --- Domov: prečo -------------------------------------------------------
    'home.why.label': 'Prečo Y-A-S',
    'home.why.heading': 'Malý tím, skutočná zodpovednosť.',
    'home.why.body':
      'Žiadne odovzdávanie medzi account managermi a inžiniermi — hovoríte priamo s ľuďmi, ktorí píšu váš kód. Vyberáme nudné, spoľahlivé technológie, aby váš produkt zostal udržiavateľný dlho po spustení.',

    // --- Domov: ako pracujeme -----------------------------------------------
    'home.how.label': 'Ako pracujeme',
    'home.how.heading': 'Od nápadu po nasadenie.',
    'home.how.body':
      'Postupujeme v malých, sústredených iteráciách — špecifikácia, vývoj, revízia, nasadenie. Každý projekt dostane jasnú architektúru, otestovaný kód a dokumentáciu, ktorú váš tím naozaj využije.',
    'home.how.discovery': 'Analýza',
    'home.how.build': 'Vývoj',
    'home.how.review': 'Revízia',
    'home.how.ship': 'Nasadenie',

    // --- Domov: vybrané práce ------------------------------------------------
    'home.work.label': 'Vybrané práce',
    'home.work.heading': 'Čo sme dodali.',
    'home.work.body':
      'Open-source knižnice, hackathony a komunitné platformy — postavené a prevádzkované naším tímom.',
    'home.work.viewAll': 'Zobraziť všetky projekty',

    // --- Domov: výzva na blog -------------------------------------------------
    'home.blog.label': 'Od tímu',
    'home.blog.heading': 'Čítajte náš blog',
    'home.blog.body':
      'Návody a hlbšie pohľady na Blazor, .NET a spôsob, akým staviame softvér.',
    'home.blog.explore': 'Preskúmať blog',

    // --- Popisky v diagramoch -------------------------------------------------
    'scene.you': 'Vy',
    'scene.developers': 'vývojári',
    'scene.accountManager': 'account manager',
    'scene.noHandoffs': 'žiadne odovzdávanie',

    // --- Blog -----------------------------------------------------------------
    'blog.title': 'Blog',
    'blog.description':
      'Postrehy, návody a úvahy o vývoji softvéru od tímu Y-A-S.',
    'blog.browseTags': 'Prehľadávať podľa tagov:',
    'blog.browseSeries': 'Prehľadávať podľa sérií:',
    'blog.readMore': 'Čítať ďalej →',
    'blog.by': 'od',
    'blog.empty': 'Zatiaľ žiadne príspevky — vráťte sa čoskoro.',
    'blog.backToBlog': 'Späť na blog',
    'blog.published': 'Publikované',
    'blog.author': 'Autor',
    'blog.tags': 'Tagy:',
    'blog.series': 'Séria:',
    'blog.seriesNav': 'Navigácia v sérii',
    'blog.progress': 'Postup:',
    // Slovak puts the whole relation before the name — "Časť 1 zo série <X>" —
    // so the trailing half is deliberately empty.
    'blog.seriesPartBefore': 'Časť {order} zo série',
    'blog.seriesPartAfter': '',
    'blog.tagPrefix': 'Tag:',
    'blog.taggedWith': 'Príspevky označené tagom',
    'blog.seriesAllPosts': 'Všetky príspevky v sérii {series}',

    // --- Projekty --------------------------------------------------------------
    'projects.title': 'Projekty',
    'projects.description':
      'Preskúmajte projekty, ktoré tím Y-A-S postavil v C#, Blazore a ďalších technológiách.',
    'projects.details': 'Detaily projektu',
    'projects.technologies': 'Technológie:',
    'projects.date': 'Dátum:',
    'projects.visitPage': 'Navštíviť stránku',
    'projects.githubRepo': 'GitHub repozitár',
    'projects.back': '← Späť na projekty',
    'projects.learnMore': 'Zistiť viac',

    // --- Kontakt ----------------------------------------------------------------
    'contact.title': 'Kontakt',
    'contact.description': 'Spojte sa s tímom Y-A-S.',
    'contact.heading': 'Ozvite sa nám',
    'contact.body':
      'Najlepší spôsob, ako nás zastihnúť, je cez GitHub. Sme vždy otvorení spolupráci, otázkam aj spätnej väzbe.',
    'contact.github': 'GitHub:',
    'contact.closing': 'Tešíme sa na spojenie s vami.',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UIKey = keyof (typeof ui)['en'];

/**
 * Returns a lookup for `lang`. Falls back to the English string when a key is
 * missing from a locale, so a half-finished translation degrades to English
 * rather than rendering the raw key.
 */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    const dict = ui[lang] as Record<string, string>;
    let value = dict[key] ?? (ui[defaultLang] as Record<string, string>)[key] ?? key;
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replaceAll(`{${name}}`, String(replacement));
      }
    }
    return value;
  };
}

/**
 * "post"/"posts" in English, but Slovak splits counts three ways: 1 príspevok,
 * 2–4 príspevky, 0 and 5+ príspevkov.
 */
export function pluralPosts(lang: Lang, count: number): string {
  if (lang === 'sk') {
    if (count === 1) return 'príspevok';
    if (count >= 2 && count <= 4) return 'príspevky';
    return 'príspevkov';
  }
  return count === 1 ? 'post' : 'posts';
}

/** Formats a date in the reader's locale ("15 January 2024" / "15. januára 2024"). */
export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(localeTags[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
