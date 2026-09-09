import React, { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, Lock, Moon, Sun, ArrowUpRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/*  Kept separate from the UI. Only the four real words live here —    */
/*  nothing beyond what was provided is invented.                      */
/* ------------------------------------------------------------------ */

/**
 * @typedef Word
 * @property {string} id
 * @property {string} word
 * @property {string} category
 * @property {string} definition
 * @property {string} [story]
 * @property {string} [date]
 * @property {string[]} [examples]
 * @property {string[]} [tags]
 * @property {boolean} [secret]
 * @property {boolean} [locked]
 */

/** @type {Word[]} */
const words = [
  {
    id: "asterisco",
    word: "asterisco",
    category: "marcador",
    definition:
      "Usado para avisar que o que acabou de ser dito é brincadeira, zoeira ou não deve ser levado completamente a sério.",
    examples: ["Você é muito insuportável. Asterisco."],
    tags: ["brincadeira", "zoeira"],
  },
  {
    id: "terra-morta",
    word: "terra morta",
    category: "expressão",
    definition:
      "Momento em que uma interação que estava fluindo, especialmente um flerte, perde completamente o clima. É quando alguém fala ou faz alguma coisa e, de repente, acabou. Morreu. Terra morta.",
    examples: ["Eu tava flertando com você e você manda isso? Terra morta."],
    tags: ["flerte", "clima", "zoeira"],
  },
  {
    id: "agua-viva",
    word: "água-viva",
    category: "palavra-código",
    definition:
      "Palavra secreta que será dita quando ela estiver pronta para ser pedida em namoro.",
    secret: true,
    locked: true,
    tags: ["secreta", "futuro"],
  },
  {
    id: "vermelho",
    word: "vermelho",
    category: "código",
    definition: "Código utilizado quando ela chega lá.",
    examples: ["Vermelho."],
    tags: ["código"],
  },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normalize(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function firstLetter(word) {
  const n = normalize(word);
  return n ? n.charAt(0).toUpperCase() : "";
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / 86400000);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function FieldLabel({ children }) {
  return (
    <p className="text-[11px] tracking-[0.14em] text-[var(--ink-soft)] mb-2 flex items-center gap-2">
      <span className="inline-block w-2.5 h-px bg-[var(--red)]" />
      {children}
    </p>
  );
}

function WordFields({ w }) {
  if (w.secret || w.locked) {
    return (
      <div className="pb-8 sm:pb-10">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={12} strokeWidth={1.75} className="text-[var(--red)]" />
          <span className="text-[12px] tracking-[0.14em] text-[var(--red)]">
            [ {w.locked ? "AGUARDANDO" : "SECRETA"} ]
          </span>
        </div>

        <div className="space-y-1.5 mb-6 max-w-[220px]" aria-hidden="true">
          <div className="h-2 rounded-[1px] bg-[var(--ink-soft)]/15 w-[85%]" />
          <div className="h-2 rounded-[1px] bg-[var(--ink-soft)]/15 w-[60%]" />
          <div className="h-2 rounded-[1px] bg-[var(--ink-soft)]/15 w-[72%]" />
        </div>

        <p className="font-serif italic text-[18px] sm:text-[19px] leading-relaxed text-[var(--ink)] max-w-[46ch]">
          Essa palavra ainda está esperando o momento certo.
        </p>

        {w.tags && w.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
            {w.tags.map((t) => (
              <span key={t} className="text-[13px] text-[var(--ink-soft)] italic">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-8 sm:pb-10">
      <div className="border-t border-[var(--line)] pt-6 mb-6">
        <FieldLabel>definição</FieldLabel>
        <p className="font-serif text-[19px] sm:text-[21px] leading-[1.6] text-[var(--ink)] max-w-[58ch]">
          {w.definition}
        </p>
      </div>

      {w.examples && w.examples.length > 0 && (
        <div className="border-t border-[var(--line)] pt-6 mb-6">
          <FieldLabel>exemplo</FieldLabel>
          <div className="space-y-1.5">
            {w.examples.map((ex, i) => (
              <p
                key={i}
                className="text-[15px] sm:text-[16px] text-[var(--ink-soft)] italic max-w-[52ch] leading-relaxed"
              >
                “{ex}”
              </p>
            ))}
          </div>
        </div>
      )}

      {w.story && (
        <div className="border-t border-[var(--line)] pt-6 mb-6">
          <FieldLabel>história</FieldLabel>
          <p className="text-[15px] text-[var(--ink)] leading-relaxed max-w-[52ch]">
            {w.story}
          </p>
        </div>
      )}

      {w.date && (
        <div className="border-t border-[var(--line)] pt-6 mb-6">
          <FieldLabel>criado em</FieldLabel>
          <p className="text-[15px] text-[var(--ink)]">{w.date}</p>
        </div>
      )}

      {w.tags && w.tags.length > 0 && (
        <div className="border-t border-[var(--line)] pt-6 flex flex-wrap gap-x-4 gap-y-1">
          {w.tags.map((t) => (
            <span key={t} className="text-[13px] text-[var(--ink-soft)] italic">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function WordRow({ w, num, isOpen, onToggle, registerRef, highlighted, reduceMotion }) {
  const panelId = `word-panel-${w.id}`;
  const buttonId = `word-button-${w.id}`;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={(el) => registerRef(w.id, el)}
      animate={
        highlighted && !reduceMotion
          ? { backgroundColor: ["var(--red-soft)", "rgba(0,0,0,0)"] }
          : {}
      }
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="border-b border-[var(--line)]"
    >
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => onToggle(w.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group w-full flex items-baseline gap-4 sm:gap-6 py-5 sm:py-6 text-left
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-sm"
      >
        <span
          className={`hidden sm:block font-serif text-[15px] w-8 shrink-0 tabular-nums transition-colors ${
            isOpen ? "text-[var(--red)]" : "text-[var(--ink-soft)]"
          }`}
        >
          {pad2(num)}
        </span>

        <span className="flex-1 min-w-0">
          <span
            className={`block font-serif transition-colors ${
              w.secret || w.locked ? "italic" : ""
            } ${isOpen ? "text-[var(--red)]" : "text-[var(--ink)] group-hover:text-[var(--red)]"}`}
            style={{ fontSize: "clamp(26px, 5vw, 40px)", lineHeight: 1.05 }}
          >
            {w.word}
          </span>
        </span>

        <span className="flex flex-col items-end gap-1 shrink-0">
          <span className="hidden sm:inline text-[11px] tracking-[0.14em] text-[var(--ink-soft)]">
            {w.category.toUpperCase()}
          </span>
          <span
            className={`hidden sm:inline text-[12px] text-[var(--red)] transition-opacity duration-200 ${
              hovered && !isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            abrir definição →
          </span>
        </span>
      </button>
      <span className="sm:hidden block -mt-2 mb-4 pl-0.5 text-[11px] tracking-[0.14em] text-[var(--ink-soft)]">
        {w.category.toUpperCase()}
      </span>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.32,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="sm:pl-14">
              <WordFields w={w} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function NossoDicionario() {
  const reduceMotion = useReducedMotion();

  const [theme, setTheme] = useState("light");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [openIds, setOpenIds] = useState(() => new Set());
  const [highlightId, setHighlightId] = useState(null);
  const [titleClicks, setTitleClicks] = useState(0);
  const [showTitleEgg, setShowTitleEgg] = useState(false);
  const [footerEggOpen, setFooterEggOpen] = useState(false);

  const itemRefs = useRef({});
  const letterRefs = useRef({});

  const registerItemRef = useCallback((id, el) => {
    itemRefs.current[id] = el;
  }, []);
  const registerLetterRef = useCallback((letter, el) => {
    letterRefs.current[letter] = el;
  }, []);

  const lettersWithWords = useMemo(() => {
    return new Set(words.map((w) => firstLetter(w.word)));
  }, []);

  // Stable numbering — computed once from the full alphabetical order,
  // independent of the current search filter.
  const numberedSorted = useMemo(() => {
    const sorted = [...words].sort((a, b) =>
      a.word.localeCompare(b.word, "pt-BR", { sensitivity: "base" })
    );
    return sorted.map((w, i) => ({ ...w, num: i + 1 }));
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return numberedSorted;
    return numberedSorted.filter((w) => {
      const haystack = normalize(
        [w.word, w.definition, w.story, w.category, ...(w.examples || []), ...(w.tags || [])]
          .filter(Boolean)
          .join(" ")
      );
      return haystack.includes(q);
    });
  }, [query, numberedSorted]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((w) => {
      const letter = firstLetter(w.word);
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(w);
    });
    return map;
  }, [filtered]);

  const wordOfDay = useMemo(() => {
    const pool = words.filter((w) => !w.secret);
    if (pool.length === 0) return null;
    return pool[dayOfYear(new Date()) % pool.length];
  }, []);

  const toggleWord = useCallback((id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const scrollToLetter = useCallback(
    (letter) => {
      const el = letterRefs.current[letter];
      if (el) {
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    },
    [reduceMotion]
  );

  const handleSurprise = useCallback(() => {
    const pool = words.filter((w) => !w.secret);
    if (pool.length === 0) return;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setQuery("");
    setOpenIds((prev) => new Set(prev).add(random.id));
    setHighlightId(random.id);
    requestAnimationFrame(() => {
      itemRefs.current[random.id]?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
    });
    setTimeout(() => setHighlightId(null), 1400);
  }, [reduceMotion]);

  const handleTitleClick = useCallback(() => {
    setTitleClicks((c) => {
      const next = c + 1;
      if (next >= 5) {
        setShowTitleEgg(true);
        setTimeout(() => setShowTitleEgg(false), 4000);
        return 0;
      }
      return next;
    });
  }, []);

  const searchEgg = normalize(query).includes("eu te amo");
  const totalLabel = `palavra${words.length === 1 ? "" : "s"} no nosso idioma`;

  return (
    <div className={theme === "dark" ? "ndic-root dark" : "ndic-root"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600&display=swap');
        .ndic-root {
          --bg: #F8F5EF;
          --bg-soft: #F1ECE1;
          --ink: #171514;
          --ink-soft: #6B6259;
          --line: #E4DCCB;
          --red: #B4232F;
          --red-soft: rgba(180,35,47,0.08);
        }
        .ndic-root.dark {
          --bg: #141312;
          --bg-soft: #1C1A18;
          --ink: #F3EFE7;
          --ink-soft: #9A9188;
          --line: #2E2B27;
          --red: #D6434F;
          --red-soft: rgba(214,67,79,0.14);
        }
        .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans { font-family: 'Manrope', system-ui, sans-serif; }
      `}</style>

      <div className="font-sans bg-[var(--bg)] text-[var(--ink)] min-h-screen transition-colors duration-300">
        {/* ---------------------------------------------------------- */}
        {/* Header                                                     */}
        {/* ---------------------------------------------------------- */}
        <header className="max-w-[880px] mx-auto px-6 sm:px-10 pt-14 sm:pt-20 pb-12 sm:pb-16 relative">
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            className="absolute right-6 sm:right-10 top-14 sm:top-20 w-8 h-8 flex items-center justify-center
                       text-[var(--ink-soft)] hover:text-[var(--red)] transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] rounded-sm"
          >
            {theme === "dark" ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
          </button>

          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
            <span className="text-[11px] tracking-[0.16em] text-[var(--ink-soft)]">
              IDIOMA PRIVADO
            </span>
          </div>

          <button
            onClick={handleTitleClick}
            className="block font-serif text-left leading-[0.95] text-[var(--ink)]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--bg)] rounded-sm"
            style={{ fontSize: "clamp(44px, 9vw, 84px)" }}
          >
            Nosso Dicionário
          </button>

          <p className="font-serif italic text-[19px] sm:text-[23px] text-[var(--red)] mt-4">
            Um idioma que só nós dois falamos.
          </p>

          <p className="font-serif italic text-[15px] sm:text-[16px] text-[var(--ink-soft)] mt-6 leading-relaxed max-w-[36ch]">
            Algumas palavras existem para todo mundo.
            <br />
            Algumas só existem para nós.
          </p>

          <AnimatePresence>
            {showTitleEgg && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.3 }}
                className="mt-5 font-serif italic text-[14px] text-[var(--red)]"
              >
                achou. tem mais palavras vindo por aí.
              </motion.p>
            )}
          </AnimatePresence>
        </header>

        <main className="max-w-[880px] mx-auto px-6 sm:px-10">
          {/* -------------------------------------------------------- */}
          {/* Counter + surprise link                                  */}
          {/* -------------------------------------------------------- */}
          <section className="mb-10 sm:mb-14 border-t border-[var(--line)] pt-6 flex items-end justify-between gap-6 flex-wrap">
            <div className="flex items-baseline gap-3">
              <span
                className="font-serif text-[var(--ink)]/15 leading-none"
                style={{ fontSize: "clamp(40px, 7vw, 60px)", color: "var(--ink)", opacity: 0.16 }}
              >
                {pad2(words.length)}
              </span>
              <span className="text-[13px] text-[var(--ink-soft)] tracking-wide">
                {totalLabel}
              </span>
            </div>
            <button
              onClick={handleSurprise}
              className="inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] text-[var(--ink)]
                         hover:text-[var(--red)] transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-sm"
            >
              Descobrir uma palavra
              <ArrowUpRight size={15} strokeWidth={1.75} />
            </button>
          </section>

          {/* -------------------------------------------------------- */}
          {/* Search                                                   */}
          {/* -------------------------------------------------------- */}
          <section className="mb-10 sm:mb-14">
            <label htmlFor="dict-search" className="sr-only">
              Procure uma palavra
            </label>
            <div className="relative flex items-center gap-3">
              <Search
                size={18}
                strokeWidth={1.75}
                className={`shrink-0 transition-colors ${
                  searchFocused ? "text-[var(--red)]" : "text-[var(--ink-soft)]"
                }`}
              />
              <input
                id="dict-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Procure uma palavra..."
                className="w-full bg-transparent font-serif text-[22px] sm:text-[26px] text-[var(--ink)]
                           placeholder:text-[var(--ink-soft)] placeholder:italic
                           focus:outline-none py-2"
              />
            </div>
            <div
              className={`h-px mt-1 transition-colors duration-200 ${
                searchFocused ? "bg-[var(--red)]" : "bg-[var(--line)]"
              }`}
            />
            <p aria-live="polite" className="sr-only">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </p>

            <AnimatePresence>
              {searchEgg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
                  className="mt-3 font-serif italic text-[15px] text-[var(--red)]"
                >
                  também. sempre.
                </motion.p>
              )}
            </AnimatePresence>
          </section>

          {/* -------------------------------------------------------- */}
          {/* Alphabet nav — hidden while actively searching            */}
          {/* -------------------------------------------------------- */}
          {!query.trim() && (
            <nav
              aria-label="Navegação alfabética"
              className="mb-12 sm:mb-16 -mx-6 sm:mx-0 px-6 sm:px-0 overflow-x-auto"
            >
              <ul className="flex gap-3.5 sm:gap-4 sm:flex-wrap w-max sm:w-auto">
                {ALPHABET.map((letter) => {
                  const active = lettersWithWords.has(letter);
                  return (
                    <li key={letter}>
                      <button
                        disabled={!active}
                        onClick={() => scrollToLetter(letter)}
                        aria-label={active ? `Ir para a letra ${letter}` : `Sem palavras em ${letter}`}
                        className={`text-[15px] font-sans transition-all
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-sm
                          ${
                            active
                              ? "text-[var(--ink)] hover:text-[var(--red)] hover:underline underline-offset-4"
                              : "text-[var(--ink-soft)]/40 cursor-default"
                          }`}
                      >
                        {letter}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {/* -------------------------------------------------------- */}
          {/* Word of the day                                          */}
          {/* -------------------------------------------------------- */}
          {wordOfDay && (
            <section className="mb-14 sm:mb-20 border-t border-[var(--line)] pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-px bg-[var(--red)]" />
                <span className="text-[11px] tracking-[0.14em] text-[var(--ink-soft)]">
                  palavra do dia
                </span>
              </div>
              <p className="font-serif text-[32px] sm:text-[38px] text-[var(--ink)] leading-none">
                {wordOfDay.word}
              </p>
              <p className="font-serif italic text-[15px] text-[var(--red)] mt-2 mb-3">
                / {wordOfDay.category} /
              </p>
              <p className="text-[15px] text-[var(--ink-soft)] italic leading-relaxed max-w-[50ch]">
                “{wordOfDay.definition.split(". ")[0]}.”
              </p>
            </section>
          )}

          {/* -------------------------------------------------------- */}
          {/* Dictionary                                               */}
          {/* -------------------------------------------------------- */}
          <section className="mb-16 sm:mb-24" aria-label="Dicionário">
            {grouped.size === 0 ? (
              <div className="text-center py-20 px-6 border-t border-b border-[var(--line)]">
                <p className="font-serif text-[22px] text-[var(--ink)]">
                  Essa palavra ainda não existe no nosso idioma.
                </p>
                <p className="font-serif italic text-[16px] text-[var(--ink-soft)] mt-2">
                  Talvez esteja na hora de inventarmos uma.
                </p>
              </div>
            ) : (
              <div className="space-y-12 sm:space-y-16">
                {Array.from(grouped.entries()).map(([letter, entries]) => (
                  <div key={letter} ref={(el) => registerLetterRef(letter, el)} className="scroll-mt-6">
                    <div className="flex items-baseline gap-4 mb-1">
                      <span
                        className="font-serif leading-none text-[var(--red)]"
                        style={{ fontSize: "clamp(32px, 6vw, 46px)" }}
                      >
                        {letter}
                      </span>
                      <span className="h-px flex-1 bg-[var(--line)]" />
                    </div>
                    <div>
                      {entries.map((w) => (
                        <WordRow
                          key={w.id}
                          w={w}
                          num={w.num}
                          isOpen={openIds.has(w.id)}
                          onToggle={toggleWord}
                          registerRef={registerItemRef}
                          highlighted={highlightId === w.id}
                          reduceMotion={reduceMotion}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* -------------------------------------------------------- */}
        {/* Footer                                                    */}
        {/* -------------------------------------------------------- */}
        <footer className="border-t border-[var(--line)] py-10 px-6 text-center">
          <p className="font-serif text-[17px] text-[var(--ink)]">Nosso Dicionário</p>
          <p className="text-[13px] text-[var(--ink-soft)] mt-1">Feito para duas pessoas.</p>
          <button
            onClick={() => setFooterEggOpen((v) => !v)}
            className="mt-3 text-[13px] text-[var(--ink-soft)] italic focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--red)] rounded-sm"
            aria-expanded={footerEggOpen}
          >
            Ainda estamos inventando palavras.
          </button>
          <AnimatePresence>
            {footerEggOpen && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
                className="text-[13px] text-[var(--red)] italic mt-2 overflow-hidden"
              >
                se você leu até aqui, isso já diz muito sobre você.
              </motion.p>
            )}
          </AnimatePresence>
        </footer>
      </div>
    </div>
  );
}
