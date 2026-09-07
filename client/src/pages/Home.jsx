import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errorText } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Spinner, Empty, Alert, inputClass } from "../components/ui";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "footwear", "jewellery", "accessories", "other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "free size"];
const CONDITIONS = ["like new", "good", "fair"];

const SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
];

// Cycled through under the wordmark so the hero never sits completely still.
const RAILS = ["denim", "jewellery", "sarees", "knitwear", "sneakers", "leather"];

// One tap from the hero into a filtered rack.
const SHORTCUTS = [
  ["jewellery", "Jewellery"],
  ["dresses", "Dresses & sarees"],
  ["outerwear", "Jackets"],
  ["tops", "Kurtas & knits"],
  ["footwear", "Shoes"],
  ["accessories", "Bags"],
];

// The woven strip that runs under the hero. Doubled in the markup so the
// loop has something to scroll into.
const TICKER = [
  "1 of 1",
  "pre-loved",
  "nothing new made",
  "hand-picked",
  "washed & pressed",
  "shipped by the seller",
  "zero waste",
];

function Home() {
  // Filters live in the URL, so a filtered view is shareable and the back
  // button behaves the way people expect.
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [rail, setRail] = useState(0);

  const page = Number(searchParams.get("page") || 1);

  // The one word in the hero that changes. Slow enough to read.
  useEffect(() => {
    const id = setInterval(() => setRail((i) => (i + 1) % RAILS.length), 2200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    api
      .get(`/products?${searchParams.toString()}`)
      .then((res) => {
        if (cancelled) return;
        // Defensive defaults — an unexpected response shape should show an
        // empty rack, not crash the page on products.length.
        setProducts(res.data?.products || []);
        setPages(res.data?.pages || 1);
        setTotal(res.data?.total || 0);
      })
      .catch((err) => !cancelled && setError(errorText(err, "Could not load listings.")))
      .finally(() => !cancelled && setLoading(false));

    // Stops a slow earlier request from overwriting a newer result.
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  // Any filter change resets to page 1 — staying on page 4 of a set that now
  // has 2 pages shows an empty grid.
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.delete("page");
    setSearchParams(next);
  };

  const goToPage = (n) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", n);
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  };

  const clearAll = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  const active = [...searchParams.keys()].filter((k) => k !== "page").length;

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-bone">
        {/* Shop-window light, then the twill weave over the top of it. */}
        <div className="pointer-events-none absolute inset-0 hero-glow" />
        <div className="pointer-events-none absolute inset-0 hero-weave opacity-[0.06]" />

        <div className="relative mx-auto max-w-6xl px-5 pt-12 pb-10 sm:pt-16">
          <p className="care-label inline-flex items-center gap-2 rounded-full border border-bone/25 px-3 py-1.5 text-stitch">
            <span className="animate-blink h-1.5 w-1.5 rounded-full bg-stitch" />
            {total > 0 ? `${total} pieces on the rack` : "Second-hand only"} · one
            of one
          </p>

          {/* The shop sign. */}
          <h1 className="wordmark mt-5">ThriftVerse</h1>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-display text-2xl leading-tight font-extrabold sm:text-4xl">
                Old soul.{" "}
                <span className="text-stitch">New wardrobe.</span>
              </p>

              <p className="mt-2 font-mono text-sm text-bone/60">
                today on the rails —{" "}
                <span key={rail} className="animate-rise inline-block text-denim-light">
                  {RAILS[rail]}
                </span>
              </p>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-bone/70">
              Nothing here was made for you. It was made, worn, kept and then
              passed on — which is the whole point. Search it, try it on, take
              it home.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam("search", searchInput.trim());
            }}
            className="mt-8 flex max-w-xl overflow-hidden rounded-full bg-bone p-1.5 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.9)]"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Denim jacket, Banarasi saree, size M…"
              aria-label="Search listings"
              className="w-full bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-fade focus:outline-none"
            />

            <button
              type="submit"
              className="care-label shrink-0 rounded-full bg-ink px-6 py-3 text-bone transition hover:bg-stamp"
            >
              Search
            </button>
          </form>

          {/* Straight to a rail, no scrolling to the filter bar. */}
          <div className="mt-5 flex flex-wrap gap-2">
            {SHORTCUTS.map(([value, label]) => {
              const on = searchParams.get("category") === value;

              return (
                <button
                  key={value}
                  onClick={() => setParam("category", on ? "" : value)}
                  className={`care-label rounded-full border px-3.5 py-2 transition ${
                    on
                      ? "border-stitch bg-stitch text-ink"
                      : "border-bone/25 text-bone/75 hover:border-stitch hover:text-stitch"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Woven care-label tape, running on a loop. */}
        <div className="relative flex overflow-hidden border-y border-bone/10 bg-bone/5 py-2.5">
          <div className="marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {TICKER.map((word) => (
                  <span
                    key={word}
                    className="care-label flex items-center gap-6 px-6 text-bone/50"
                  >
                    {word}
                    <span className="text-stitch">✻</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-wash bg-white p-3 shadow-[0_18px_40px_-32px_rgba(20,22,43,0.8)]">
          <select
            value={searchParams.get("category") || ""}
            onChange={(e) => setParam("category", e.target.value)}
            aria-label="Category"
            className={`${inputClass} w-auto`}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={searchParams.get("size") || ""}
            onChange={(e) => setParam("size", e.target.value)}
            aria-label="Size"
            className={`${inputClass} w-auto`}
          >
            <option value="">Any size</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={searchParams.get("condition") || ""}
            onChange={(e) => setParam("condition", e.target.value)}
            aria-label="Condition"
            className={`${inputClass} w-auto`}
          >
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Min ₹"
            aria-label="Minimum price"
            value={searchParams.get("minPrice") || ""}
            onChange={(e) => setParam("minPrice", e.target.value)}
            className={`${inputClass} w-24`}
          />

          <input
            type="number"
            min="0"
            placeholder="Max ₹"
            aria-label="Maximum price"
            value={searchParams.get("maxPrice") || ""}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className={`${inputClass} w-24`}
          />

          <select
            value={searchParams.get("sort") || "newest"}
            onChange={(e) => setParam("sort", e.target.value)}
            aria-label="Sort by"
            className={`${inputClass} ml-auto w-auto`}
          >
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {active > 0 && (
            <button onClick={clearAll} className="care-label px-2 text-stamp">
              Clear ({active})
            </button>
          )}
        </div>

        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>

        {loading ? (
          <Spinner label="Pulling the rack" />
        ) : products.length === 0 ? (
          <div className="mt-6">
            <Empty
              title="Nothing on the rack for that"
              body="Try widening the price range or clearing a filter."
            />
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-end justify-between gap-4">
              <h2 className="wordmark-sm text-2xl sm:text-3xl">
                {searchParams.get("category") || "The rack"}
              </h2>

              <p className="care-label pb-1 text-fade">
                {total} {total === 1 ? "piece" : "pieces"} · all one of one
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="care-label rounded-full border-2 border-ink px-5 py-2.5 transition hover:bg-ink hover:text-bone disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
                >
                  Previous
                </button>

                <span className="care-label text-fade">
                  Page {page} of {pages}
                </span>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pages}
                  className="care-label rounded-full border-2 border-ink px-5 py-2.5 transition hover:bg-ink hover:text-bone disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Home;
