import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { errorText } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Spinner, Empty, Alert, inputClass } from "../components/ui";

const CATEGORIES = ["tops", "bottoms", "dresses", "outerwear", "footwear", "accessories", "other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "free size"];
const CONDITIONS = ["like new", "good", "fair"];

const SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["price_asc", "Price: low to high"],
  ["price_desc", "Price: high to low"],
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

  const page = Number(searchParams.get("page") || 1);

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
      <section className="bg-ink text-bone">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="care-label text-stitch">Second-hand · one of one</p>

          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-extrabold sm:text-6xl">
            Someone already loved this.
            <span className="block text-denim-light">Your turn.</span>
          </h1>

          <p className="mt-5 max-w-xl text-bone/70">
            Every piece here is a single item, listed by the person who wore it.
            Search it, filter it, try it on, then take it home.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam("search", searchInput.trim());
            }}
            className="mt-8 flex max-w-lg"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Denim jacket, Levi's, size M…"
              aria-label="Search listings"
              className="w-full bg-bone px-4 py-3 text-sm text-ink placeholder:text-fade focus:outline-none"
            />

            <button
              type="submit"
              className="bg-stitch px-6 py-3 text-sm font-medium text-ink hover:bg-white"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="stitch flex flex-wrap items-center gap-2 bg-white p-3">
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
            <p className="care-label mt-6 text-fade">
              {total} {total === 1 ? "piece" : "pieces"}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="care-label border-2 border-ink px-4 py-2 disabled:opacity-30"
                >
                  Previous
                </button>

                <span className="care-label text-fade">
                  Page {page} of {pages}
                </span>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pages}
                  className="care-label border-2 border-ink px-4 py-2 disabled:opacity-30"
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
