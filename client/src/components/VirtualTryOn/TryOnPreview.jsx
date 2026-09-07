import { Button, money } from "../ui";

// The confirmation step: your photo next to the garment, so it's obvious
// what is about to be combined before anyone spends a generation on it.
function TryOnPreview({ photoUrl, product, garmentImage, onGenerate, onChange }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <figure>
          <div className="aspect-3/4 overflow-hidden rounded-xl bg-wash">
            <img
              src={photoUrl}
              alt="The photo you chose"
              className="h-full w-full object-cover"
            />
          </div>

          <figcaption className="care-label mt-2 text-fade">Your photo</figcaption>
        </figure>

        <figure>
          <div className="aspect-3/4 overflow-hidden rounded-xl bg-wash">
            <img
              src={garmentImage}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          <figcaption className="care-label mt-2 truncate text-fade">
            {product.title}
          </figcaption>
        </figure>
      </div>

      <p className="mt-4 text-sm text-fade">
        {product.title} · <span className="font-mono">{money(product.price)}</span>
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button onClick={onGenerate}>Generate virtual try-on</Button>

        <Button variant="outline" onClick={onChange}>
          Use a different photo
        </Button>
      </div>
    </div>
  );
}

export default TryOnPreview;
