import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { money, Tag } from "./ui";

// `image` is the old single-image field — keep reading it so listings made
// before the schema change still show a photo.
export function coverImage(product) {
  return product.images?.[0] || product.image || "/placeholder.svg";
}

function ProductCard({ product }) {
  const { user } = useAuth();
  const wishlist = useWishlist();

  const saved = wishlist?.has(product._id);

  return (
    <article className="lift group relative overflow-hidden rounded-2xl border border-wash bg-white">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-4/5 overflow-hidden bg-wash">
          <img
            src={coverImage(product)}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.07]"
          />

          {/* Ink wash from the bottom, so the tags stay readable on any photo. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

          {/* Every thrift piece is unique stock of one. Worth saying. */}
          <span className="care-label absolute top-3 left-3 rounded-full bg-ink/85 px-2.5 py-1 text-bone backdrop-blur">
            1 of 1
          </span>

          {/* The hand-written sticker a charity shop would slap on. */}
          <span className="price-tag absolute bottom-3 left-3 rotate-[-3deg] px-2.5 py-1 text-sm font-medium text-ink">
            {money(product.price)}
          </span>

          {product.status === "sold" && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/70">
              <span className="care-label rotate-[-8deg] border-2 border-stamp px-4 py-2 text-stamp">
                Sold
              </span>
            </span>
          )}
        </div>
      </Link>

      {user && (
        <button
          onClick={() => wishlist.toggle(product._id)}
          aria-label={saved ? "Remove from saved" : "Save this item"}
          className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-bone/90 text-lg shadow-sm transition hover:scale-110 hover:bg-bone"
        >
          <span className={saved ? "text-stamp" : "text-fade"}>
            {saved ? "♥" : "♡"}
          </span>
        </button>
      )}

      <div className="p-3.5">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-display text-base leading-tight font-semibold transition group-hover:text-stamp">
            {product.title}
          </h3>
        </Link>

        {/* The care label — the strip sewn inside every garment. */}
        <div className="stitch-t mt-3 flex flex-wrap gap-1.5 pt-2.5">
          <Tag>{product.size || "free size"}</Tag>
          <Tag>{product.condition || "good"}</Tag>
          {product.brand && <Tag tone="stitch">{product.brand}</Tag>}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
