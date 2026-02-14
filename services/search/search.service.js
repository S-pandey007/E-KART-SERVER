import Products from "../../models/product-model.js";
import Categories from "../../models/category-model.js";
import logger from "../../config/logger.js";
import Influencers from "../../models/InfluencerSchema-model.js";
import ProductVariant from "../../models/productVariant-model.js";

// query suggestions logic
const getSearchSuggestions = async (query, limit = 10) => {
  try {
    // =============================================
    // Basic validation
    // If user sends empty query or only spaces,we immediately return
    // empty result.
    // =============================================
    if (!query || !query.trim()) {
      return {
        success: false,
        message: "Item not found! Try again",
        products: [],
        categories: [],
      };
    }

    // =============================================
    // Clean & escape user input
    // we sanitize special regex characters like:
    // . * + ? $ {}()| [] \
    // so that malicious or invalid regex patterns do not
    // break our query or cause security issues.
    // =============================================
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // =============================================
    // create a case-insensitive regex.
    // this allows partial matching like:
    // "iph" -> matches "iPhone"
    // =============================================
    const searchRegex = new RegExp(escapedQuery, "i");

    // =============================================
    // Run all searches in parallel
    // we use Promise.all() so that:
    // -Product search
    // -Category search
    // -Variant search
    // all run at the same time.

    // this significantlly reduces response time
    //compared to sequential awaits.
    // =============================================
    const [productMatches, categoryMatches, variantMatches] = await Promise.all(
      [
        // =============================================
        // We search across multiple fields:
        // - name,brandName,shortDescription ,longDecription,tags
        // only active & non deleted products are allowed.
        // we only select "name" because suggestion
        // =============================================
        Products.find({
          $or: [
            { name: searchRegex },
            { brandName: searchRegex },
            { shortDescription: searchRegex },
            { longDescription: searchRegex },
            { tags: searchRegex },
          ],
          status: "active",
          isDeleted: false,
        })
          .select("name")
          .limit(limit)
          .lean(),

        // =============================================
        // Search in Categories
        // if user types something like "mobile"
        // and category name is "Mobiles",
        // it will match here
        // we select both _id and name because
        // we may need _id later to fetch products.
        // =============================================
        Categories.find({
          name: searchRegex,
        })
          .select("_id name")
          .limit(limit)
          .lean(),

        // =============================================
        // Search in Product Variants
        // This allows searching variant -productName -attributes (size,color,storage)
        // attributes.$* allows searching inside
        // dynamic object keys.
        // =============================================
        ProductVariant.find({
          $or: [{ productName: searchRegex }, { "attributes.$*": searchRegex }],
          status: "active",
        })
          .select("productId")
          .limit(limit)
          .lean(),
      ],
    );

    // =============================================
    // If variants matched → fetch parent products
    // Variants themselves are not shown in suggesstions
    // we show parent product name.
    // Example :
    // user searches :"128 GB"
    // that may match variant attributes,
    // but we show product name.
    // =============================================
    let variantProductNames = [];

    if (variantMatches.length > 0) {
      // remove duplicate productIds using set
      const variantProductIds = [
        ...new Set(variantMatches.map((v) => v.productId)),
      ];

      // fetch parent products
      const variantProducts = await Products.find({
        _id: { $in: variantProductIds },
        status: "active",
        isDeleted: false,
      })
        .select("name")
        .lean();

      variantProductNames = variantProducts.map((p) => p.name);
    }

    // =============================================
    // If category matched → fetch some products
    // we suggest some products fomr that category.

    //Example:
    // query:"mobile"
    // category:"Mobiles"
    // we fetch some mobile product name
    // =============================================
    let categoryProductNames = [];

    if (categoryMatches.length > 0) {
      const categoryIds = categoryMatches.map((c) => c._id);

      const categoryProducts = await Products.find({
        categoryId: { $in: categoryIds },
        status: "active",
        isDeleted: false,
      })
        .select("name")
        .limit(5)
        .lean();

      categoryProductNames = categoryProducts.map((p) => p.name);
    }

    // =============================================
    // Merge & remove duplicates
    // Direct product matches
    // variant-based product matches
    // category-based product matches

    // use set to remove duplicates.
    // then slice to ensure we don't exceed limit
    // =============================================
    const productNames = [
      ...new Set([
        ...productMatches.map((p) => p.name),
        ...variantProductNames,
        ...categoryProductNames,
      ]),
    ].slice(0, limit);

    // =============================================
    // Return response
    // - product name suggesstions
    // - category name suggesttions
    // =============================================
    return {
      success: true,
      products: productNames,
      categories: categoryMatches.map((c) => c.name),
    };
  } catch (error) {
    logger.error(error, "Error fetching suggestion data");
    return {
      success: false,
      error: error.message,
    };
  }
};

// query search products logic
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchProducts = async ({
  query,
  category,
  page = 1,
  limit = 10,
  sort,
}) => {
  try {
    // ================================
    // Pagination Setup
    // calculate how many documents to skip based on page number.
    // ================================
    const skip = (page - 1) * limit;

    // ================================
    // Base filter → Always applied
    // This ensure:
    // - Only active products are shown
    // - Only non-deleted products are shown
    // ================================
    let filter = {
      status: "active",
      isDeleted: false,
    };

    // ================================
    // return all data for (Testing purpose).
    // - all products
    // - total count
    // - some influencers data
    // ================================
    if (query === "alldata") {
      const [products, total, influencers] = await Promise.all([
        Products.find({}).skip(skip).limit(limit).lean(),

        Products.countDocuments(),

        Influencers.find({})
          .limit(10)
          .select("name images likes views tags")
          .lean(),
      ]);

      return {
        success: true,
        products,
        influencers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // ====================================================
    // SEARCH BY QUERY (Product + Variant + Category)
    // This block handles main search funtionality.
    // It searchs across:
    // - Product fields
    // - Product Variants
    // - Categories
    // Then mearges matching product IDs.
    // ====================================================
    if (query) {
      // ====================================================
      // Split query into words
      // for multi-word search
      // like "iphone 15 pro" becomes ["iphone","15","pro"]
      // escapeRegex prevent regex injection.
      // ====================================================
      const words = query
        .trim()
        .split(/\s+/)
        .map((w) => escapeRegex(w));

      // ====================================================
      // Build advanced regex pattern
      // Example: "iphone 15" → (?=.*iphone)(?=.*15)
      // this ensure all words must exists in the text
      // ====================================================
      const regexPattern = words.map((w) => `(?=.*${w})`).join("");

      const searchRegex = {
        $regex: regexPattern,
        $options: "i",
      };

      // ====================================================
      // Search in Products collection
      // Match across name,brandName, shortDescription, -longDescription -tags
      // ====================================================
      const matchedProducts = await Products.find({
        $or: [
          { name: searchRegex },
          { brandName: searchRegex },
          { shortDescription: searchRegex },
          { longDescription: searchRegex },
          { tags: searchRegex },
        ],
        status: "active",
        isDeleted: false,
      })
        .select("_id")
        .lean();

      // ====================================================
      // Search in Product Variants
      // This enables searching variant-specific attributes.
      // attributes.$* allos dynamic key search
      // we collect parent productid from variants
      // ====================================================
      const matchedVariants = await ProductVariant.find({
        $or: [
          { productName: searchRegex },
          { "attributes.$*": searchRegex }, // dynamic attribute search
        ],
        status: "active",
      })
        .select("productId")
        .lean();

      // ====================================================
      // Search in Categories
      // if query match category name,
      // we will late fetch products from that category
      // ====================================================
      const matchedCategories = await Categories.find({
        name: { $regex: escapeRegex(query), $options: "i" },
      })
        .select("_id")
        .lean();

      // Collect productIds from product match
      const productIdsFromProducts = matchedProducts.map((p) =>
        p._id.toString(),
      );

      // Collect productIds from variant match
      const productIdsFromVariants = matchedVariants.map((v) =>
        v.productId.toString(),
      );

      // ====================================================
      // If category matched → find its products
      // We convert category match into product matches.
      // ====================================================
      let productIdsFromCategory = [];

      if (matchedCategories.length > 0) {
        const categoryIds = matchedCategories.map((c) => c._id);

        const categoryProducts = await Products.find({
          categoryId: { $in: categoryIds },
          status: "active",
          isDeleted: false,
        })
          .select("_id")
          .lean();

        productIdsFromCategory = categoryProducts.map((p) => p._id.toString());
      }

      // ====================================================
      // Merge All Product IDs
      // Direct product matches
      // variant-based matches
      // category-based matches
      // use set to remove duplicates.
      // ====================================================
      const finalUniqueIds = [
        ...new Set([
          ...productIdsFromProducts,
          ...productIdsFromVariants,
          ...productIdsFromCategory,
        ]),
      ];

      // If nothing matched → return empty
      if (finalUniqueIds.length === 0) {
        return {
          success: true,
          products: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }

      // Apply ID filter
      filter._id = { $in: finalUniqueIds };
    }

    // ====================================================
    // CATEGORY FILTER (from filter dropdown)
    // this is seperate from query search.
    // if user selects a category filter from UI,
    // ====================================================
    if (category) {
      const categoryDoc = await Categories.findOne({
        name: { $regex: escapeRegex(category), $options: "i" },
      }).select("_id");

      if (!categoryDoc) {
        return {
          success: true,
          products: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        };
      }

      filter.categoryId = categoryDoc._id;
    }

    // ====================================================
    // FETCH PRODUCTS
    // - status filter
    // - isDeleted filter
    // - pagination
    // - sort
    // - category filter
    // - _id filter

    // populate("categoryId") adds category name
    // ====================================================
    const products = await Products.find(filter)
      .populate("categoryId", "name")
      .sort(sort === "newest" ? { createdAt: -1 } : {})
      .skip(skip)
      .limit(limit)
      .lean();

    const productIds = products.map((p) => p._id);

    // ====================================================
    // FETCH ACTIVE VARIANTS
    // only fetch variants for current page product
    // ====================================================
    const variants = await ProductVariant.find({
      productId: { $in: productIds },
      status: "active",
    }).lean();

    // ====================================================
    // PRICE SORT (lowest variant price)
    // we calculate minimum sellingPrice per product
    // ====================================================
    if (sort === "price_asc" || sort === "price_desc") {
      const priceMap = {};

      variants.forEach((v) => {
        const id = v.productId.toString();

        if (!priceMap[id]) {
          priceMap[id] = v.sellingPrice;
        } else {
          priceMap[id] = Math.min(priceMap[id], v.sellingPrice);
        }
      });

      products.sort((a, b) => {
        const priceA = priceMap[a._id.toString()] || 0;
        const priceB = priceMap[b._id.toString()] || 0;

        return sort === "price_asc" ? priceA - priceB : priceB - priceA;
      });
    }

    // ====================================================
    // Attach variants to each product
    // embed variant inside product response.
    // this prepare final response strucutre for fontend.
    // ====================================================
    const finalProducts = products.map((product) => ({
      ...product,
      variants: variants.filter(
        (v) => v.productId.toString() === product._id.toString(),
      ),
    }));

    // Count total
    const total = await Products.countDocuments(filter);

    const influencers = await Influencers.find({})
          .limit(10)
          .select("name images likes views tags")
          .lean()
    

    return {
      success: true,
      products: finalProducts,
      influencers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Search Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export { getSearchSuggestions, searchProducts };
