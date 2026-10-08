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
    'footer.privacy': 'Privacy policy',

    // --- Company details (the values themselves live in src/company.ts) ---
    'company.cvr': 'CVR',
    'company.country': 'Denmark',

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
      "Write to us by email, or find us on GitHub. We're always open to collaboration, questions, and feedback.",
    'contact.email': 'Email:',
    'contact.github': 'GitHub:',
    'contact.company': 'Company details',
    'contact.closing': 'Looking forward to connecting with you.',

    // --- Privacy policy ------------------------------------------------------
    'privacy.title': 'Privacy Policy',
    'privacy.description': 'How Y-A-S ApS handles personal data on y-a-s.net.',
    'privacy.who.heading': 'Who we are',
    'privacy.who.body':
      'This website is run by the company below, which is the data controller for the personal data described on this page.',
    'privacy.collect.heading': 'What we collect',
    'privacy.collect.body':
      'The site is hosted by Cloudflare. When you open a page, Cloudflare processes technical request data on our behalf: your IP address, browser type, the page requested and the time. If you email us, we receive your email address and whatever you choose to write.',
    'privacy.not.heading': 'What we do not do',
    'privacy.not.body':
      'This site sets no cookies and uses no analytics, tracking or advertising. It has no forms, accounts or newsletter. Fonts, scripts and images are served from our own domain, so opening a page contacts no company other than our hosting provider.',
    'privacy.why.heading': 'Why we process it',
    'privacy.why.body':
      'Request data is processed to deliver the site and keep it secure, and emails are processed to answer you. The legal basis for both is our legitimate interest (GDPR Article 6(1)(f)); if your enquiry is about a contract with us, it is Article 6(1)(b).',
    'privacy.recipients.heading': 'Who receives it',
    'privacy.recipients.body':
      'Cloudflare, as our hosting provider, and Google, whose Google Workspace service handles our email. Both act on our instructions as data processors. We do not sell personal data or share it with anyone else.',
    'privacy.transfers.heading': 'Transfers outside the EU',
    'privacy.transfers.body':
      'Cloudflare and Google are companies based in the United States, so personal data may be processed outside the EU/EEA. Such transfers are covered by the EU–US Data Privacy Framework and by the European Commission’s standard contractual clauses.',
    'privacy.retention.heading': 'How long we keep it',
    'privacy.retention.body':
      'We keep emails for as long as it takes to handle your enquiry, and longer only where the law requires it, for example for bookkeeping. We keep no visitor logs of our own; Cloudflare retains request data only for a short time, according to its own retention rules.',
    'privacy.rights.heading': 'Your rights',
    'privacy.rights.body':
      'You can ask for access to the personal data we hold about you, have it corrected or deleted, object to or restrict its processing, and receive it in a portable format. We make no automated decisions about you. To use your rights, write to',
    'privacy.complaints.heading': 'Complaints',
    'privacy.complaints.body':
      'If you think we handle your data wrongly, you can complain to the Danish Data Protection Agency (Datatilsynet):',
    'privacy.updated': 'Last updated:',
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
    'footer.privacy': 'Ochrana súkromia',

    // --- Údaje o spoločnosti (samotné hodnoty sú v src/company.ts) ---------
    'company.cvr': 'CVR',
    'company.country': 'Dánsko',

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
      'Napíšte nám e-mail alebo nás nájdite na GitHube. Sme vždy otvorení spolupráci, otázkam aj spätnej väzbe.',
    'contact.email': 'E-mail:',
    'contact.github': 'GitHub:',
    'contact.company': 'Údaje o spoločnosti',
    'contact.closing': 'Tešíme sa na spojenie s vami.',

    // --- Ochrana súkromia -----------------------------------------------------
    'privacy.title': 'Ochrana súkromia',
    'privacy.description': 'Ako Y-A-S ApS zaobchádza s osobnými údajmi na y-a-s.net.',
    'privacy.who.heading': 'Kto sme',
    'privacy.who.body':
      'Túto webovú stránku prevádzkuje nižšie uvedená spoločnosť, ktorá je prevádzkovateľom osobných údajov opísaných na tejto stránke.',
    'privacy.collect.heading': 'Čo zbierame',
    'privacy.collect.body':
      'Stránku hostuje Cloudflare. Keď otvoríte stránku, Cloudflare v našom mene spracúva technické údaje o požiadavke: vašu IP adresu, typ prehliadača, požadovanú stránku a čas. Ak nám napíšete e-mail, dostaneme vašu e-mailovú adresu a to, čo sa rozhodnete napísať.',
    'privacy.not.heading': 'Čo nerobíme',
    'privacy.not.body':
      'Táto stránka neukladá žiadne cookies a nepoužíva analytiku, sledovanie ani reklamu. Nemá formuláre, účty ani newsletter. Písma, skripty a obrázky sa načítavajú z našej vlastnej domény, takže otvorenie stránky nekontaktuje žiadnu inú spoločnosť okrem nášho poskytovateľa hostingu.',
    'privacy.why.heading': 'Prečo údaje spracúvame',
    'privacy.why.body':
      'Údaje o požiadavke spracúvame, aby sme stránku doručili a udržali ju bezpečnú, a e-maily, aby sme vám odpovedali. Právnym základom je v oboch prípadoch náš oprávnený záujem (článok 6 ods. 1 písm. f) GDPR); ak sa vaša otázka týka zmluvy s nami, je ním článok 6 ods. 1 písm. b).',
    'privacy.recipients.heading': 'Kto údaje dostáva',
    'privacy.recipients.body':
      'Cloudflare ako náš poskytovateľ hostingu a Google, ktorého služba Google Workspace zabezpečuje náš e-mail. Obaja konajú podľa našich pokynov ako sprostredkovatelia. Osobné údaje nepredávame ani ich nezdieľame s nikým ďalším.',
    'privacy.transfers.heading': 'Prenosy mimo EÚ',
    'privacy.transfers.body':
      'Cloudflare a Google sú spoločnosti so sídlom v Spojených štátoch, takže osobné údaje môžu byť spracúvané mimo EÚ/EHP. Tieto prenosy sú kryté Rámcom ochrany osobných údajov medzi EÚ a USA a štandardnými zmluvnými doložkami Európskej komisie.',
    'privacy.retention.heading': 'Ako dlho údaje uchovávame',
    'privacy.retention.body':
      'E-maily uchovávame tak dlho, ako je potrebné na vybavenie vašej otázky, a dlhšie iba vtedy, keď to vyžaduje zákon, napríklad pre účtovníctvo. Vlastné záznamy o návštevníkoch nevedieme; Cloudflare uchováva údaje o požiadavkách len krátko, podľa vlastných pravidiel uchovávania.',
    'privacy.rights.heading': 'Vaše práva',
    'privacy.rights.body':
      'Môžete požiadať o prístup k osobným údajom, ktoré o vás máme, o ich opravu alebo vymazanie, namietať proti ich spracúvaniu alebo ho nechať obmedziť a získať ich v prenosnom formáte. Nerobíme o vás žiadne automatizované rozhodnutia. Svoje práva uplatníte e-mailom na',
    'privacy.complaints.heading': 'Sťažnosti',
    'privacy.complaints.body':
      'Ak si myslíte, že s vašimi údajmi zaobchádzame nesprávne, môžete podať sťažnosť dánskemu úradu na ochranu údajov (Datatilsynet):',
    'privacy.updated': 'Naposledy aktualizované:',
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
