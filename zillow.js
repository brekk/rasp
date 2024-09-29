(function scrimscram() {
  /* selectors: brittle */
  const selectors = {
    monthly: "dYtaCG",
    bedBathArea: "dMuLer",
    details: "boagUb",
    costs: "jrOuuo",
    address: "jbRdkh",
  };

  /* utilities */
  const costToNumber = (x) =>
    x.startsWith("$") ? parseFloat(x.replace(/[,/\a-z\$]/g, "")) : "--";
  const camel = (str) =>
    str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (m, i) =>
      +m === 0 ? "" : i === 0 ? m.toLowerCase() : m.toUpperCase(),
    );
  const clean = (x) => x.toLowerCase().replace(/[\s]/g, " ");
  const map = (fn) => (x) => Array.prototype.map.call(x, fn);
  const nth = (xs) => (y) => xs[y] || {};
  const text = (x) => x.innerText || "";
  const $$ = document.querySelectorAll.bind(document);

  /* core */
  const parse = () => {
    console.log(`scraping data from this page...`);
    const lookups = Object.fromEntries(
      Object.entries(selectors).map(([k, v]) => [k, $$("." + v)]),
    );
    const bba = nth(lookups.bedBathArea);
    const details = nth(lookups.details);
    const address = text(nth(lookups.address)(2));

    const costs = Object.fromEntries(
      map(([k, v]) => {
        const n = camel(k);
        return ["cost" + n[0].toUpperCase() + n.slice(1), v];
      })(map((y) => text(y).split("\n"))(lookups.costs)),
    );
    const raw = {
      beds: bba(0),
      baths: bba(1),
      area: bba(2),
      costFee: details(2),
      pets: details(3),
      laundry: details(5),
      costMonthly: nth(lookups.monthly)(0),
    };

    const structured = {
      ...Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, clean(text(v))]),
      ),
      ...costs,
    };
    const nice = Object.fromEntries(
      Object.entries(structured).map(([k, v]) => [
        k,
        k.startsWith("cost") ? costToNumber(v) : v,
      ]),
      structured,
    );
    window.temp = nice;
    return nice;
  };

  /* main */
  const KEY = "moving";
  const stuff = (k, v) => window.localStorage.setItem(k, JSON.stringify(v));
  const grab = (k) => JSON.parse(window.localStorage.getItem(k));
  const jam = (k, v) => {
    console.log(`getting "${KEY}" from localStorage`);
    const raw = grab(KEY);
    console.log(`adding "${k}" to "${KEY}" to localStorage`);
    return stuff(KEY, { ...raw, [k]: v });
  };
  jam(document.URL, parse());
})();
