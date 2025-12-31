import Products from "../../models/product-model.js";
import Categories from "../../models/category-model.js";
import logger from "../../config/logger.js";
import Influencers from "../../models/InfluencerSchema-model.js";

const getSearchSuggestions = async (query, limit = 10) => {
  try {
    if (!query) {
      return {
        success: false,
        message: "Item not found ! Try again",
        products: [],
        categories: [],
      };
    }

    const words = query
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    const regex = new RegExp(
      words.map((w) => `(?=.*\\b${w}\\b)`).join(""),
      "i"
    );

    let backupSuggesttion = [];
    const [products, categories] = await Promise.all([
      Products.find({ name: regex }).select("name").limit(limit).lean(),

      Categories.find({ name: regex }).select("name").limit(limit).lean(),
    ]);

    if (!products.length && categories.length > 0) {
      let FetchDatalimit;
      if (categories.length > 1) {
        FetchDatalimit = 1;
        for (let i = 0; i < categories.length; i++) {
          let data = await Products.find({ category: categories[i] })
            .select("name")
            .limit(FetchDatalimit)
            .lean();

          backupSuggesttion = backupSuggesttion.concat(data);
        }
      }
      if (categories.length === 1) {
        FetchDatalimit = 4;
        for (let i = 0; i < categories.length; i++) {
          let data = await Products.find({ category: categories[i] })
            .select("name")
            .limit(FetchDatalimit)
            .lean();
          backupSuggesttion = backupSuggesttion.concat(data);
        }
      }
    }

    return {
      success: true,
      products:
        products.length > 0
          ? products.map((p) => p.name)
          : backupSuggesttion.map((p) => p.name),
      categories: categories.map((c) => c.name),
    };
  } catch (error) {
    logger.error(error, "Error fetch suggestion data");
    return {
      success: false,
      error: error.message,
    };
  }
};

// search products
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchProducts = async ({
  query,
  category,
  page = 1,
  limit = 10,
  sort,
}) => {
  try {
    const skip = (page - 1) * limit;
    let filter = {};
    let categoryFromQuery = null;
    let influencers = [];

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

    if (query && typeof query === "string") {
      const words = query
        .trim()
        .split(/\s+/)
        .map((w) => escapeRegex(w));

      filter.name = {
        $regex: words.map((w) => `(?=.*\\b${w}\\b)`).join(""),
        $options: "i",
      };

      categoryFromQuery = await Categories.findOne({
        name: { $regex: `^${escapeRegex(query)}$`, $options: "i" },
      }).select("_id");

      const influencerFilter = {
        $or: [
          {
            name: {
              $regex: words.map((w) => `(?=.*\\b${w}\\b)`).join(""),
              $options: "i",
            },
          },
          {
            tags: {
              $regex: words.join("|"),
              $options: "i",
            },
          },
        ],
      };

      influencers = await Influencers.find(influencerFilter)
        .select("name images likes views tags")
        .limit(10)
        .lean();
    }

    if (category) {
      const categoryDoc = await Categories.findOne({
        name: { $regex: `^${escapeRegex(category)}$`, $options: "i" },
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

      filter.category = categoryDoc._id;
    }

    if (categoryFromQuery && !filter.category) {
      filter.$or = [
        { name: filter.name }, // name match
        { category: categoryFromQuery._id }, // category match
      ];
      delete filter.name;
    }

    let sortOption = {};
    if (sort === "price_asc") sortOption.price = 1;
    if (sort === "price_desc") sortOption.price = -1;
    if (sort === "newest") sortOption.createdAt = -1;

    const [products, total] = await Promise.all([
      Products.find(filter)
        .populate("category", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      Products.countDocuments(filter),
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
  } catch (error) {
    logger.error(error, "search product");
    return {
      success: false,
      error: error.message,
    };
  }
};

export { getSearchSuggestions, searchProducts };
