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
    <article className="group relative bg-white">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative aspect-4/5 overflow-hidden bg-wash">
          <img
            src={coverImage(product)}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Every thrift piece is unique stock of one. Worth saying. */}
          <span className="care-label absolute top-0 left-0 bg-ink px-2 py-1 text-bone">
            1 of 1
          </span>

          {product.status === "sold" && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/70">
              <span className="care-label border-2 border-bone px-4 py-2 text-bone">
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
          className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center bg-bone/90 text-lg transition hover:bg-bone"
        >
          <span className={saved ? "text-stamp" : "text-fade"}>
            {saved ? "♥" : "♡"}
          </span>
        </button>
      )}

      <div className="p-3">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-display text-base leading-tight hover:text-denim">
            {product.title}
          </h3>
        </Link>

        <p className="mt-1 font-mono text-sm text-ink">{money(product.price)}</p>

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
