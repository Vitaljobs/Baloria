import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "nl" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Landing
  "landing.subtitle": { nl: "Ontdek. Verbind. Groei.", en: "Discover. Connect. Grow." },
  "landing.desc": { nl: "Het sociale Q&A platform waar elke vraag een bal is die wacht om gevangen te worden.", en: "The social Q&A platform where every question is a ball waiting to be caught." },
  "landing.cta": { nl: "Gratis beginnen", en: "Start for free" },
  "landing.login": { nl: "Inloggen", en: "Log in" },
  "landing.scroll": { nl: "Scroll om meer te ontdekken", en: "Scroll to discover more" },
  "landing.whatIs": { nl: "Wat is Baloria?", en: "What is Baloria?" },
  "landing.whereLive": { nl: "Waar vragen tot", en: "Where questions come" },
  "landing.whereLive2": { nl: "leven komen", en: "to life" },
  "landing.whatIsDesc": {
    nl: "Baloria is een revolutionair sociaal platform waar jouw vragen letterlijk als kleurrijke ballen door een virtuele ruimte zweven. Vang een bal, geef een antwoord, en maak een echte connectie. Geen algoritmes, geen eindeloos scrollen — alleen intentionele, menselijke interactie.",
    en: "Baloria is a revolutionary social platform where your questions literally float as colorful balls through a virtual space. Catch a ball, give an answer, and make a real connection. No algorithms, no endless scrolling — just intentional, human interaction.",
  },
  "landing.howItWorks": { nl: "Hoe werkt het?", en: "How does it work?" },
  "landing.threeSteps": { nl: "Drie stappen naar verbinding", en: "Three steps to connection" },
  "landing.step1": { nl: "Gooi een bal", en: "Throw a ball" },
  "landing.step1Desc": { nl: "Kies een thema en stel je vraag. Je bal verschijnt als een kleurrijke bol in de ballebak.", en: "Choose a theme and ask your question. Your ball appears as a colorful sphere in the ball pit." },
  "landing.step2": { nl: "Vang een bal", en: "Catch a ball" },
  "landing.step2Desc": { nl: "Ontdek vragen van anderen. Je hebt 15 minuten om een doordacht antwoord te geven.", en: "Discover questions from others. You have 15 minutes to give a thoughtful answer." },
  "landing.step3": { nl: "Maak connectie", en: "Make a connection" },
  "landing.step3Desc": { nl: "Waardeer antwoorden met hartjes, bouw je karma op en ontgrendel nieuwe privileges.", en: "Appreciate answers with hearts, build your karma and unlock new privileges." },
  "landing.moreThanQA": { nl: "Meer dan Q&A", en: "More than Q&A" },
  "landing.specialBalls": { nl: "Speciale Ballen", en: "Special Balls" },
  "landing.readyToPlay": { nl: "Klaar om te spelen?", en: "Ready to play?" },
  "landing.readyDesc": { nl: "Sluit je aan bij een community waar elke interactie telt. Gratis starten, geen verplichtingen.", en: "Join a community where every interaction counts. Start for free, no obligations." },
  "landing.startNow": { nl: "Start nu — het is gratis", en: "Start now — it's free" },
  "landing.footer": { nl: "© 2025 Baloria — Sociaal Q&A Platform", en: "© 2025 Baloria — Social Q&A Platform" },
  // Features
  "feature.questions": { nl: "Stel vragen als ballen", en: "Ask questions as balls" },
  "feature.questionsDesc": { nl: "Gooi je vraag in de ballebak en kijk hoe anderen hem opvangen. Elke bal is een kans op verbinding.", en: "Throw your question in the ball pit and see how others catch it. Every ball is a chance to connect." },
  "feature.privacy": { nl: "Privacy-first design", en: "Privacy-first design" },
  "feature.privacyDesc": { nl: "Jouw identiteit is beschermd met onze Identity Bridge. Deel wat je wilt, wanneer je wilt.", en: "Your identity is protected with our Identity Bridge. Share what you want, when you want." },
  "feature.fast": { nl: "15-minuten antwoorden", en: "15-minute answers" },
  "feature.fastDesc": { nl: "Geen eindeloos scrollen. Snelle, intentionele interacties die ertoe doen.", en: "No endless scrolling. Quick, intentional interactions that matter." },
  "feature.connect": { nl: "Echte connecties", en: "Real connections" },
  "feature.connectDesc": { nl: "Van levensvraag tot vacature — ontmoet mensen met gedeelde interesses.", en: "From life questions to job openings — meet people with shared interests." },
  // Stats
  "stat.themes": { nl: "Thema's", en: "Themes" },
  "stat.responseTime": { nl: "Antwoordtijd", en: "Response time" },
  "stat.possibilities": { nl: "Mogelijkheden", en: "Possibilities" },
  "stat.anonymous": { nl: "Anoniem", en: "Anonymous" },
  // Special balls
  "ball.vacancies": { nl: "Vacatures", en: "Vacancies" },
  "ball.housing": { nl: "Woningen", en: "Housing" },
  "ball.education": { nl: "Opleidingen", en: "Education" },
  "ball.collaboration": { nl: "Samenwerking", en: "Collaboration" },
  // Login
  "login.back": { nl: "Terug naar Baloria", en: "Back to Baloria" },
  "login.welcome": { nl: "Welkom terug", en: "Welcome back" },
  "login.subtitle": { nl: "Log in op je Baloria account", en: "Log in to your Baloria account" },
  "login.email": { nl: "E-mailadres", en: "Email address" },
  "login.password": { nl: "Wachtwoord", en: "Password" },
  "login.submit": { nl: "Inloggen", en: "Log in" },
  "login.noAccount": { nl: "Nog geen account?", en: "Don't have an account?" },
  "login.register": { nl: "Registreer nu", en: "Register now" },
  "login.fillAll": { nl: "Vul alle velden in", en: "Fill in all fields" },
  "login.invalid": { nl: "Onjuist e-mailadres of wachtwoord", en: "Incorrect email or password" },
  // Register
  "register.title": { nl: "Account aanmaken", en: "Create account" },
  "register.subtitle": { nl: "Word onderdeel van de Baloria community", en: "Become part of the Baloria community" },
  "register.name": { nl: "Naam", en: "Name" },
  "register.namePlaceholder": { nl: "Je volledige naam", en: "Your full name" },
  "register.passwordHint": { nl: "Minimaal 8 karakters", en: "Minimum 8 characters" },
  "register.submit": { nl: "Registreren", en: "Register" },
  "register.hasAccount": { nl: "Al een account?", en: "Already have an account?" },
  "register.login": { nl: "Log in", en: "Log in" },
  "register.fillAll": { nl: "Vul alle velden in", en: "Fill in all fields" },
  "register.passwordShort": { nl: "Wachtwoord moet minimaal 8 karakters zijn", en: "Password must be at least 8 characters" },
  "register.exists": { nl: "Dit e-mailadres is al geregistreerd", en: "This email address is already registered" },
  "register.success": { nl: "Account aangemaakt! Controleer je e-mail om te bevestigen.", en: "Account created! Check your email to confirm." },
  // Pages
  "pages.back": { nl: "Terug", en: "Back" },
  // Footer links
  "footer.privacy": { nl: "Privacybeleid", en: "Privacy Policy" },
  "footer.terms": { nl: "Algemene voorwaarden", en: "Terms of Service" },
  "footer.about": { nl: "Over ons", en: "About us" },
  "footer.contact": { nl: "Contact", en: "Contact" },
  // Contact page
  "contact.title": { nl: "Contact", en: "Contact" },
  "contact.subtitle": { nl: "Heb je een vraag, suggestie of feedback? We horen graag van je.", en: "Have a question, suggestion or feedback? We'd love to hear from you." },
  "contact.emailNote": { nl: "Je kunt ons ook direct mailen", en: "You can also email us directly" },
  "contact.name": { nl: "Naam", en: "Name" },
  "contact.email": { nl: "E-mailadres", en: "Email" },
  "contact.subject": { nl: "Onderwerp", en: "Subject" },
  "contact.message": { nl: "Bericht", en: "Message" },
  "contact.send": { nl: "Versturen", en: "Send" },
  "contact.fillAll": { nl: "Vul alle velden in", en: "Please fill in all fields" },
  "contact.success": { nl: "Bericht verzonden! We nemen zo snel mogelijk contact op.", en: "Message sent! We'll get back to you as soon as possible." },
  "contact.error": { nl: "Er ging iets mis. Probeer het later opnieuw.", en: "Something went wrong. Please try again later." },
  // Privacy page
  "privacy.title": { nl: "Privacybeleid", en: "Privacy Policy" },
  "privacy.intro": { nl: "Bij Baloria nemen we jouw privacy serieus. Dit privacybeleid legt uit hoe we je persoonlijke gegevens verzamelen, gebruiken en beschermen wanneer je ons platform gebruikt.", en: "At Baloria, we take your privacy seriously. This privacy policy explains how we collect, use, and protect your personal data when you use our platform." },
  "privacy.collect.title": { nl: "Welke gegevens verzamelen we?", en: "What data do we collect?" },
  "privacy.collect.text": { nl: "We verzamelen alleen de gegevens die nodig zijn om ons platform te laten werken: je e-mailadres, weergavenaam, en de vragen en antwoorden die je op het platform plaatst. We gebruiken cookies alleen voor essentiële functionaliteit zoals het onthouden van je inlogsessie en taalvoorkeur.", en: "We only collect data necessary to operate our platform: your email address, display name, and the questions and answers you post on the platform. We use cookies only for essential functionality like remembering your login session and language preference." },
  "privacy.use.title": { nl: "Hoe gebruiken we je gegevens?", en: "How do we use your data?" },
  "privacy.use.text": { nl: "Je gegevens worden gebruikt om je account te beheren, je vragen en antwoorden te tonen aan andere gebruikers, en om je karma en statistieken bij te houden. We verkopen je gegevens nooit aan derden en gebruiken ze niet voor advertentiedoeleinden.", en: "Your data is used to manage your account, display your questions and answers to other users, and track your karma and statistics. We never sell your data to third parties and do not use it for advertising purposes." },
  "privacy.share.title": { nl: "Delen we je gegevens?", en: "Do we share your data?" },
  "privacy.share.text": { nl: "Nee. We delen je persoonlijke gegevens niet met derden, tenzij dit wettelijk verplicht is. Het Baloria Identity Bridge-systeem zorgt ervoor dat je anoniem kunt deelnemen wanneer je dat wilt.", en: "No. We do not share your personal data with third parties unless legally required. The Baloria Identity Bridge system ensures you can participate anonymously when you choose to." },
  "privacy.cookies.title": { nl: "Cookies", en: "Cookies" },
  "privacy.cookies.text": { nl: "We gebruiken alleen strikt noodzakelijke cookies voor authenticatie en taalvoorkeur. We plaatsen geen tracking cookies of analytics cookies van derden.", en: "We only use strictly necessary cookies for authentication and language preference. We do not place tracking cookies or third-party analytics cookies." },
  "privacy.rights.title": { nl: "Jouw rechten", en: "Your rights" },
  "privacy.rights.text": { nl: "Je hebt het recht om je gegevens in te zien, te corrigeren of te verwijderen. Je kunt je account op elk moment verwijderen via je profielinstellingen. Neem contact met ons op als je vragen hebt over je gegevens.", en: "You have the right to access, correct, or delete your data. You can delete your account at any time via your profile settings. Contact us if you have questions about your data." },
  "privacy.contact.title": { nl: "Contact", en: "Contact" },
  "privacy.contact.text": { nl: "Voor vragen over dit privacybeleid kun je contact opnemen via voidezss@gmail.com.", en: "For questions about this privacy policy, you can contact us at voidezss@gmail.com." },
  // About page
  "about.title": { nl: "Over Baloria", en: "About Baloria" },
  "about.intro": { nl: "Baloria is meer dan een Q&A platform — het is een plek waar echte menselijke connecties ontstaan door de kracht van vragen stellen.", en: "Baloria is more than a Q&A platform — it's a place where real human connections are made through the power of asking questions." },
  "about.mission.title": { nl: "Onze missie", en: "Our mission" },
  "about.mission.text": { nl: "We geloven dat de beste gesprekken beginnen met een goede vraag. Onze missie is om een veilige, speelse omgeving te creëren waar mensen zonder angst vragen kunnen stellen en eerlijke, doordachte antwoorden kunnen geven. Geen algoritmes die bepalen wat je ziet — alleen intentionele, menselijke interactie.", en: "We believe the best conversations start with a good question. Our mission is to create a safe, playful environment where people can ask questions without fear and give honest, thoughtful answers. No algorithms deciding what you see — just intentional, human interaction." },
  "about.how.title": { nl: "Hoe het werkt", en: "How it works" },
  "about.how.text": { nl: "Op Baloria zijn vragen kleurrijke ballen die door een virtuele ballebak zweven. Kies een thema, stel je vraag, en je bal verschijnt in de ballebak. Andere gebruikers vangen jouw bal, lezen je vraag en geven een antwoord — allemaal binnen 15 minuten. Waardeer goede antwoorden met hartjes en bouw samen aan een community van kennis en verbinding.", en: "On Baloria, questions are colorful balls floating through a virtual ball pit. Choose a theme, ask your question, and your ball appears in the ball pit. Other users catch your ball, read your question and give an answer — all within 15 minutes. Appreciate good answers with hearts and build a community of knowledge and connection together." },
  "about.values.title": { nl: "Onze waarden", en: "Our values" },
  "about.values.text": { nl: "Privacy staat centraal bij alles wat we doen. Met ons Identity Bridge-systeem kun je anoniem deelnemen wanneer je dat wilt. We geloven in kwaliteit boven kwantiteit: liever één doordacht antwoord dan tien oppervlakkige reacties. En we bouwen een community waar respect en empathie de norm zijn.", en: "Privacy is central to everything we do. With our Identity Bridge system, you can participate anonymously when you choose to. We believe in quality over quantity: one thoughtful answer is better than ten superficial responses. And we build a community where respect and empathy are the norm." },
  "about.team.title": { nl: "Het team", en: "The team" },
  "about.team.text": { nl: "Baloria is gebouwd door een klein, gepassioneerd team dat gelooft in de kracht van menselijke connectie. We zijn ontwikkelaars, ontwerpers en community builders die samen werken aan een platform dat echt verschil maakt.", en: "Baloria is built by a small, passionate team that believes in the power of human connection. We are developers, designers and community builders working together on a platform that makes a real difference." },
  // Terms page
  "terms.title": { nl: "Algemene Voorwaarden", en: "Terms of Service" },
  "terms.intro": { nl: "Door gebruik te maken van Baloria ga je akkoord met deze algemene voorwaarden. Lees ze zorgvuldig door voordat je het platform gebruikt.", en: "By using Baloria, you agree to these terms of service. Please read them carefully before using the platform." },
  "terms.usage.title": { nl: "Gebruik van het platform", en: "Use of the platform" },
  "terms.usage.text": { nl: "Baloria is bedoeld voor het stellen en beantwoorden van vragen in een respectvolle omgeving. Het is niet toegestaan om het platform te gebruiken voor spam, intimidatie, haatdragende content, of enige vorm van illegale activiteiten. We behouden het recht om accounts te schorsen of te verwijderen die deze regels overtreden.", en: "Baloria is intended for asking and answering questions in a respectful environment. It is not permitted to use the platform for spam, harassment, hateful content, or any form of illegal activities. We reserve the right to suspend or delete accounts that violate these rules." },
  "terms.accounts.title": { nl: "Accounts", en: "Accounts" },
  "terms.accounts.text": { nl: "Je bent verantwoordelijk voor het beveiligen van je account en wachtwoord. Deel je inloggegevens niet met anderen. Je moet minimaal 13 jaar oud zijn om een account aan te maken. Eén persoon mag maximaal één account aanmaken.", en: "You are responsible for securing your account and password. Do not share your login credentials with others. You must be at least 13 years old to create an account. One person may create a maximum of one account." },
  "terms.content.title": { nl: "Content", en: "Content" },
  "terms.content.text": { nl: "Je behoudt de rechten op de content die je op Baloria plaatst. Door content te plaatsen geef je Baloria een licentie om deze content te tonen aan andere gebruikers van het platform. Je bent zelf verantwoordelijk voor de content die je plaatst en deze mag geen inbreuk maken op rechten van derden.", en: "You retain the rights to the content you post on Baloria. By posting content, you grant Baloria a license to display this content to other users of the platform. You are responsible for the content you post and it must not infringe on the rights of third parties." },
  "terms.liability.title": { nl: "Aansprakelijkheid", en: "Liability" },
  "terms.liability.text": { nl: "Baloria wordt aangeboden 'as is' zonder enige garantie. We zijn niet aansprakelijk voor schade die voortvloeit uit het gebruik van het platform. We doen ons best om het platform beschikbaar en veilig te houden, maar kunnen geen 100% uptime garanderen.", en: "Baloria is provided 'as is' without any warranty. We are not liable for damages arising from the use of the platform. We do our best to keep the platform available and secure, but cannot guarantee 100% uptime." },
  "terms.changes.title": { nl: "Wijzigingen", en: "Changes" },
  "terms.changes.text": { nl: "We kunnen deze voorwaarden van tijd tot tijd wijzigen. Bij belangrijke wijzigingen zullen we je hiervan op de hoogte stellen via het platform of per e-mail. Door het platform te blijven gebruiken na een wijziging, ga je akkoord met de nieuwe voorwaarden.", en: "We may change these terms from time to time. For important changes, we will notify you via the platform or by email. By continuing to use the platform after a change, you agree to the new terms." },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("baloria-lang");
    return (saved === "en" ? "en" : "nl") as Language;
  });

  const handleSetLang = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("baloria-lang", newLang);
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
