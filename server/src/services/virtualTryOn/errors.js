// One error type for the whole try-on path, carrying a `kind` the controller
// maps to an HTTP status and the client maps to a UI state. Providers throw
// these instead of bare Errors so nothing provider-specific leaks upward.

const STATUS = {
  config: 503, // no key, bad key — an operator problem, not the customer's
  busy: 503, // provider rate-limited us
  upstream: 502, // provider reachable but unhappy
  generation: 422, // the model ran and could not use this photo
  timeout: 504,
  input: 400, // bad or missing image from the customer
  unsupported: 422, // jewellery, bags, shoes
};

export class TryOnError extends Error {
  constructor(kind, message) {
    super(message);
    this.name = "TryOnError";
    this.kind = kind;
    this.status = STATUS[kind] || 500;
  }
}
