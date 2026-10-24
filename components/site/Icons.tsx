// One inline sprite for the outline icons the v1 design uses, referenced with <Icon name="…" />.
export function Icons() {
  return (
    <svg className="svg-definitions" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <symbol id="check" viewBox="0 0 24 24">
          <path d="m5 12 4 4L19 6" />
        </symbol>
        <symbol id="arrow-left" viewBox="0 0 24 24">
          <path d="M19 12H5m6-6-6 6 6 6" />
        </symbol>
        <symbol id="arrow-right" viewBox="0 0 24 24">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </symbol>
        <symbol id="copy" viewBox="0 0 24 24">
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Icon({ name }: { name: "check" | "arrow-left" | "arrow-right" | "copy" }) {
  return (
    <svg className="icon" aria-hidden="true">
      <use href={`#${name}`} />
    </svg>
  );
}

export function LearnChevron() {
  return (
    <span className="t-learn-chevron" aria-hidden="true">
      <svg viewBox="0 0 16 16">
        <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
        <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
      </svg>
    </span>
  );
}
