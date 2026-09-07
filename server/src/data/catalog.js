// The demo catalogue: real clothing and jewellery photography so the shop
// looks like a shop instead of a grid of grey placeholders.
//
// Photos are hotlinked from Unsplash's CDN (free to use, no key needed). They
// are resized on their end, so nothing here ships megabytes of image.
//
// Used by both seed.js (wipes and reseeds) and addProducts.js (tops up an
// existing database without touching what is already there).

// 4:5 portrait, which is the aspect ratio the product cards crop to.
const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=1125&q=80`;

// [title, description, price, category, size, condition, brand, ...photo ids]
const ROWS = [
  // -- jewellery ---------------------------------------------------------
  ["Gold-plated twisted hoop earrings", "Chunky twisted hoops with a warm gold finish. Light enough to wear all day, posts are still tight. Come in the original pouch.", 640, "jewellery", "free size", "like new", "", "1535632066927-ab7c9ab60908", "1621939745912-aad97fd3a34d"],
  ["Blue gemstone drop earrings", "Silver-toned drops with a deep blue stone. Faceted so they catch the light properly. Backs included.", 890, "jewellery", "free size", "good", "", "1629224316810-9d8805b95e76", "1655255114527-d0a834d9a774"],
  ["Freshwater pearl studs", "Small round pearls on silver posts. The everyday pair, dressy enough for a wedding and plain enough for work.", 750, "jewellery", "free size", "like new", "", "1617038260897-41a1f14a8ca0"],
  ["Heart pendant chain necklace", "Fine chain with a faceted heart pendant. Clasp is smooth, no kinks anywhere along the chain. Sits just below the collarbone.", 1150, "jewellery", "free size", "good", "", "1608508644127-ba99d7732fee", "1692421098809-6cdfcfea289a"],
  ["Layered gold-tone chain set", "Three chains of different lengths, meant to be worn stacked. Plating is even, no green spots. Sold as the set.", 1350, "jewellery", "free size", "good", "", "1723802205505-2f88b2227718", "1633810543462-77c4a3b13f07"],
  ["Silver solitaire ring", "925 silver with a single clear stone. Band is unmarked and the stone is secure in its setting. Size 14 in Indian sizing.", 1900, "jewellery", "free size", "like new", "", "1583937443566-6fe1a1c6e400", "1561995734-ef4b62bb6586"],
  ["Stacking rings, set of three", "Two gold-tone, one silver-tone. Slim enough to wear together on one finger or spread across a hand.", 980, "jewellery", "free size", "good", "", "1693212793204-bcea856c75fe", "1589674781759-c21c37956a44"],
  ["Gold-tone link bracelet", "Flat curb links with a lobster clasp. Heavier than it looks and hangs nicely. Slight wear on the clasp, nothing structural.", 1250, "jewellery", "free size", "good", "", "1611591437281-460bfbe1220a", "1717605383946-96c6884c36b4"],
  ["Evil eye charm bracelet", "Adjustable cord with a blue glass eye and small gold beads. Barely worn, bought it and wore it twice.", 560, "jewellery", "free size", "like new", "", "1676291055501-286c48bb186f", "1721103428133-a2635d9e62eb"],
  ["Beaded silver bracelet", "Mixed silver and brown beads on stretch cord. Cord is still tight, no beads missing.", 480, "jewellery", "free size", "good", "", "1615655114865-4cc1bda5901e", "1721206624492-3d05631471ea"],

  // -- dresses and ethnic wear -------------------------------------------
  ["Floral cotton sundress", "Light cotton with a small floral print. Ties at the waist and falls mid-calf. Washed once and pressed.", 980, "dresses", "S", "like new", "", "1762154057377-cc9d3dd6900c"],
  ["White poplin shirt dress", "Crisp cotton poplin, full button front, belted. No stains at the collar or cuffs, buttons all original.", 1250, "dresses", "M", "good", "Zara", "1532675432006-329c6fed7045"],
  ["Red floral tea dress", "Short sleeves, gathered waist, hits below the knee. Print is still bright with no fading from washing.", 1100, "dresses", "M", "good", "", "1502868354157-ec2edd2a1651"],
  ["Ivory lace midi dress", "Lined lace with a scalloped hem. One tiny pull in the lace at the back, invisible unless you go looking.", 1650, "dresses", "S", "like new", "", "1593105522065-9a6ecd21aeb2"],
  ["Emerald Banarasi silk saree", "Deep green silk with gold zari work through the pallu. Dry cleaned after its last wear. Blouse piece attached, unstitched.", 3200, "dresses", "free size", "good", "", "1679006831648-7c9ea12e5807"],
  ["Pink and orange georgette saree", "Light georgette that drapes beautifully, good for long functions when you do not want the weight of silk. Worn once.", 2400, "dresses", "free size", "like new", "", "1617627143750-d86bc21e42bb"],
  ["Indigo handloom cotton saree", "Handwoven cotton in natural indigo. Softens with every wash. Small slub in the weave near the border, part of how it is made.", 1800, "dresses", "free size", "good", "", "1610189012906-4c0aa9b9781e"],

  // -- outerwear ---------------------------------------------------------
  ["Classic blue denim jacket", "Mid-wash trucker cut with proper metal buttons. Broken in at the elbows, no rips. Layers over a kurta or a tee equally well.", 1450, "outerwear", "M", "good", "Levi's", "1555583743-991174c11425", "1527016021513-b09758b777bd"],
  ["Washed denim trucker jacket", "Lighter wash, slightly oversized fit. Chest pockets both intact, cuffs unfrayed.", 1300, "outerwear", "L", "good", "", "1537465978529-d23b17165b3b", "1611312449408-fcece27cdbb7"],
  ["Charcoal wool overcoat", "Heavy wool, single breasted, falls past the knee. Lining fully intact. A serious winter coat, not a fashion one.", 2900, "outerwear", "L", "good", "", "1495105787522-5334e3ffa0ef"],

  // -- tops --------------------------------------------------------------
  ["Cream cable-knit sweater", "Thick cable knit in undyed cream. Holds its shape at the cuffs, no pilling under the arms.", 1150, "tops", "M", "like new", "", "1631541909061-71e349d1f203", "1602706294170-1fed8eecd9f9"],
  ["Grey merino knit jumper", "Fine merino, warm without bulk. Two seasons of wear and still no pilling. Hand wash only.", 990, "tops", "S", "good", "Uniqlo", "1574201635302-388dd92a4c3f", "1536992266094-82847e1fd431"],
  ["Sage chikankari cotton kurta", "Hand embroidered chikankari on soft cotton. Full sleeves, side slits. Worn twice, embroidery all intact.", 1250, "tops", "L", "like new", "", "1727835523545-70ee992b5763", "1727835523550-18478cacefa2"],
  ["Mustard cotton kurta", "Plain mustard cotton with a mandarin collar. An easy summer piece that breathes properly in the heat.", 850, "tops", "M", "good", "", "1701365676249-9d7ab5022dec"],
  ["Floral print button-up shirt", "Black base with orange and white flowers. Rayon, so it drapes rather than stands. All buttons present.", 720, "tops", "M", "good", "", "1622780432053-767528938f34"],

  // -- bottoms -----------------------------------------------------------
  ["Straight-leg blue jeans", "Classic straight cut in mid blue. Honest fading at the knees, hems unturned. Zip runs smoothly.", 1150, "bottoms", "M", "good", "Levi's", "1602293589930-45aad59ba3ab", "1542272604-787c3835535d"],
  ["High-rise vintage jeans", "Proper high waist in rigid denim that softens as you wear it. No repairs, no thinning at the seat.", 1250, "bottoms", "L", "good", "", "1637069585336-827b298fe84a"],
  ["White pleated mini skirt", "Crisp pleats with a hidden side zip. Lined, so it is not see-through. No marks on the white.", 690, "bottoms", "S", "good", "", "1594633313515-7ad9334a2349"],
  ["White cotton midi skirt", "Simple A-line in heavy cotton, elastic at the back of the waist. Never worn, tag still on.", 780, "bottoms", "M", "like new", "", "1577900232427-18219b9166a0"],
  ["Red maxi skirt", "Full length, deep red, swishes when you walk. Waistband is unstretched. Pairs well with a plain shirt.", 950, "bottoms", "M", "good", "", "1547116180-3872338a567b"],

  // -- footwear ----------------------------------------------------------
  ["White leather high-top sneakers", "Cleaned inside and out. Leather is creased across the toe as it should be, soles have most of their tread.", 2400, "footwear", "L", "good", "Nike", "1512374382149-233c42b6a83b"],
  ["Black and red high-top sneakers", "The classic colourway. Uppers are solid and the laces have been replaced. Some sole yellowing, priced for it.", 3600, "footwear", "L", "good", "Nike", "1552346154-21d32810aba3"],
  ["Grey running trainers", "Well used but with plenty of road left. Deodorised and washed. Honest fair condition.", 1500, "footwear", "M", "fair", "Nike", "1491553895911-0055eca6402d"],
  ["Maroon canvas plimsolls", "Simple canvas slip-ons in deep maroon. Insoles still springy, canvas unmarked.", 700, "footwear", "M", "good", "", "1525966222134-fcfa99b8ae77"],

  // -- bags and accessories ----------------------------------------------
  ["Brown leather handbag", "Full grain leather that has darkened nicely with use. Lining clean, zip smooth, feet on the base unscuffed.", 1900, "accessories", "free size", "good", "", "1598532163257-ae3c6b2524b6"],
  ["Red leather tote", "Roomy enough for a laptop and a lunch. Handles unstretched, no ink marks inside.", 2200, "accessories", "free size", "like new", "", "1584917865442-de89df76afd3"],
  ["Grey leather satchel", "Structured satchel with gold buckles. Buckles unpitted, leather has one small scuff on the back.", 2600, "accessories", "free size", "good", "", "1605733513597-a8f8341084e6"],
  ["Black leather shoulder bag", "Soft unstructured leather with one main compartment and a slip pocket. Strap is adjustable.", 2100, "accessories", "free size", "good", "", "1705909237050-7a7625b47fac"],
  ["Black wayfarer sunglasses", "Lenses are scratch-free and the hinges are tight. Comes with a hard case that has seen better days.", 1200, "accessories", "free size", "good", "Ray-Ban", "1572635196237-14b3f281503f"],
  ["Gold-rim round sunglasses", "Thin gold frames with brown-tinted lenses. Bought on a trip, worn twice, then it rained for a month.", 850, "accessories", "free size", "like new", "", "1511499767150-a48a237f0083"],
  ["Printed silk scarf", "Real silk with hand-rolled edges. Big enough to wear as a headscarf or tie to a bag handle.", 550, "accessories", "free size", "good", "", "1517472292914-9570a594783b"],
];

const CATALOG = ROWS.map(
  ([title, description, price, category, size, condition, brand, ...photos]) => ({
    title,
    description,
    price,
    category,
    size,
    condition,
    brand,
    images: photos.map(img),
    // The first photo doubles as the try-on input until a seller uploads a
    // proper flat-lay.
    tryOnImage: img(photos[0]),
  })
);

export default CATALOG;
