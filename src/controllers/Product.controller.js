import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import { uploadFiles, deleteFile, deleteLocalFile } from "../utils/cloudinary.js";

export const createProduct = async (req, res, next) => {
  let uploadedFileIds = [];
  let uploadedFileUrls = [];

  try {
    const { title, description, category, tags } = req.body;
    if (!title || !description || !category) {
      if (req.files) req.files.forEach(file => deleteLocalFile(file.path));
      return next(new ApiError(400, "Title, description, and category are required"));
    }
    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, "At least one product image is required"));
    }
    const existedProduct = await Product.findOne({ title });
    if (existedProduct) {
      req.files.forEach(file => deleteLocalFile(file.path));
      return next(new ApiError(400, "Product with this title already exists"));
    }
    let result = null;
    if (process.env.USE_CLOUDINARY === "true") {
      result = await uploadFiles(req.files);
      if (!result.success) {
        return next(new ApiError(400, "Unable to upload Images"));
      }
    } else {
      result = {
        success: true,
        files: req.files.map(file => ({
          url: file.path.replace(/\\/g, "/"),
          public_url: null,
          public_id: null,
        })),
      };
    }
    uploadedFileIds = result.files.map(f => f.public_id).filter(Boolean);
    uploadedFileUrls = result.files.map(f => f.url).filter(Boolean);
    console.log(result)
    const newProduct = new Product({
      title,
      description,
      category,
      tags: tags || [],
      images: result.files.map(f => ({
        url: f?.url || null,
        public_url: f?.public_url || null,
        public_id: f?.public_id || null,
      })),
    });

  const savedProduct = await newProduct.save();

const imagesWithoutId = savedProduct.images.map(img => img.toObject && img.toObject());
const responseData = {
  ...savedProduct.toObject(),
  images: imagesWithoutId.map(({ public_id, ...rest }) => rest),
};

return res.status(201).json({
  status: "success",
  message: "Product created successfully",
  data: responseData,
});

  } catch (err) {
    for (const fileId of uploadedFileIds) {
      try { await deleteFile(fileId); } catch (e) { console.error(e); }
    }
    for (const fileUrl of uploadedFileUrls) {
      try { deleteLocalFile(fileUrl); } catch (e) { console.error(e); }
    }
    console.log(err)
    return next(new ApiError(500, err?.message || "Internal Server Error"));

  }
};

//get project by id 

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    const obj = product.toObject();
    obj.images = obj.images.map(({ public_id, ...rest }) => rest);

    return res.api(200 , "Project Data fetch successfully", obj)
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

//get by slug
export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({slug});

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    const obj = product.toObject();
    obj.images = obj.images.map(({ public_id, ...rest }) => rest);

    return res.api(200 , "Project Data fetch successfully", obj)
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};


//get all project
export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const response = products.map(p => {
      const obj = p.toObject();
      obj.images = obj.images.map(({ public_id, ...rest }) => rest);
      return obj;
    });

    return res.api(200 , "Product Fetch Successfully", response)
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

//update product
export const updateProduct = async (req, res, next) => {
  let uploadedFileIds = [];
  let uploadedFileUrls = [];

  try {
    const { id } = req.params;
    const { title, description, category, tags } = req.body;


    // Check product exists
    const product = await Product.findById(id);
    if (!product) {
      if (req.files) req.files.forEach(file => deleteLocalFile(file.path));
      return next(new ApiError(404, "Product not found"));
    }
    // if (product.title === title ) {
    //   if (req.files) req.files.forEach(file => deleteLocalFile(file.path));
    //   return next(new ApiError(404, "Product Already Existed"));
    // }
    // If files are uploaded, handle image update
    let result = null;
    if (req.files && req.files.length > 0) {
      // delete old files from cloudinary/local
      if (process.env.USE_CLOUDINARY === "true") {
        for (const img of product.images) {
          if (img.public_id) {
            try { await deleteFile(img.public_id); } catch (e) { console.error(e); }
          }
        }
      } else {
        for (const img of product.images) {
          if (img.url) {
            try { deleteLocalFile(img.url); } catch (e) { console.error(e); }
          }
        }
      }

      // upload new files
      if (process.env.USE_CLOUDINARY === "true") {
        result = await uploadFiles(req.files);
        if (!result.success) {
          return next(new ApiError(400, "Unable to upload new images"));
        }
      } else {
        result = {
          success: true,
          files: req.files.map(file => ({
            url: file.path.replace(/\\/g, "/"),
            public_url: null,
            public_id: null,
          })),
        };
      }

      uploadedFileIds = result.files.map(f => f.public_id).filter(Boolean);
      uploadedFileUrls = result.files.map(f => f.url).filter(Boolean);

      product.images = result.files.map(f => ({
        url: f?.url || null,
        public_url: f?.public_url || null,
        public_id: f?.public_id || null,
      }));
    }

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (tags) product.tags = tags;

    const updatedProduct = await product.save();

    // Remove _id from images
    const imagesWithoutId = updatedProduct.images.map(img =>
      img.toObject && img.toObject()
    );
    const responseData = {
      ...updatedProduct.toObject(),
      images: imagesWithoutId.map(({ public_id, ...rest }) => rest),
    };

    return res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: responseData,
    });

  } catch (err) {
    // cleanup newly uploaded files if error
    for (const fileId of uploadedFileIds) {
      try { await deleteFile(fileId); } catch (e) { console.error(e); }
    }
    for (const fileUrl of uploadedFileUrls) {
      try { deleteLocalFile(fileUrl); } catch (e) { console.error(e); }
    }

    console.error(err);
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};



//delete Product
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    // delete images
    if (process.env.USE_CLOUDINARY === "true") {
      for (const img of product.images) {
        if (img.public_id) {
          try { await deleteFile(img.public_id); } catch (e) { console.error(e); }
        }
      }
    } else {
      for (const img of product.images) {
        if (img.url) {
          try { deleteLocalFile(img.url); } catch (e) { console.error(e); }
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return res.api(200 , "Product deleted successfully")
  } catch (err) {
    console.error(err);
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

