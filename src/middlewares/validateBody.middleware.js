import ApiError from "../utils/ApiError.js";

export const requireBody = (model) => {
  return (req, res, next) => {
    const methods = ["POST", "PUT", "PATCH"];
    if (!methods.includes(req.method)) return next();
    if (!req.body || Object.keys(req.body).length === 0) {
      if (process.env.SHOW_SCHEMA_FIELDS === "true") {
        const fields = getSchemaFields(model);
        return res.api(
          400,
          "Request body is required",
          { requiredFields: fields.required, optionalFields: fields.optional }
        );
      }
      return next(new ApiError(400, "Request body is required"));
    }
    return next();
  };
};

const getSchemaFields = (model) => {
  const schemaPaths = model.schema.paths;
  const fields = { required: [], optional: [] };

  for (const key in schemaPaths) {
    if (["__v", "_id"].includes(key)) continue;
    const path = schemaPaths[key];
    if (path.isRequired) fields.required.push(key);
    else fields.optional.push(key);
  }

  return fields;
};
