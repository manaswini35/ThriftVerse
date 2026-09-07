import { Button, money } from "../ui";

// The result is shown here and nowhere else — it is never written back onto
// the listing, so the seller's own photos stay exactly as they were.
function TryOnResult({
  imageUrl,
  demo,
  product,
  saved,
  onSave,
  onTryAgain,
  onBrowseMore,
  onClose,
}) {
  return (
    <div>
      <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-wash shadow-[0_30px_60px_-40px_rgba(20,22,43,0.8)]">
        {/* Prepared results must never read as a generation of this
            customer's photo, so the label sits on the image itself rather
            than in fine print underneath. */}
        {demo && (
          <span className="care-label absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 text-bone backdrop-blur-sm">
            Demo preview
          </span>
        )}

        <img
          src={imageUrl}
          alt={`You wearing ${product.title}`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-5 text-center">
        <p className="font-display text-lg font-semibold">{product.title}</p>
        <p className="mt-1 font-mono text-sm text-fade">{money(product.price)}</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        {/* ThriftVerse has no cart — every piece is one of one and goes
            through the seller — so saving it is the equivalent commit. */}
        {onSave && (
          <Button onClick={onSave}>{saved ? "♥ Saved" : "♡ Save this piece"}</Button>
        )}

        <Button variant="outline" onClick={onTryAgain}>
          Try another photo
        </Button>

        <Button variant="outline" onClick={onBrowseMore}>
          Try another piece
        </Button>

        <Button variant="outline" onClick={onClose}>
          Back to the listing
        </Button>
      </div>

      <p className="care-label mt-5 text-center text-fade">
        {demo
          ? "Sample result · AI generation is switched off on this server"
          : "Generated preview · fit and colour will vary in real life"}
      </p>
    </div>
  );
}

export default TryOnResult;
