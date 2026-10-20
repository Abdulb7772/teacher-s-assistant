import { body, param } from "express-validator";

export const termValidators = [
  body("name").trim().notEmpty().withMessage("Term name is required").isLength({ max: 80 }),
  body("startDate").optional({ values: "falsy" }).isISO8601().withMessage("Invalid start date"),
  body("endDate").optional({ values: "falsy" }).isISO8601().withMessage("Invalid end date"),
];

export const paperValidators = [
  body("termId").isMongoId().withMessage("Select a valid term"),
  body("title").trim().notEmpty().withMessage("Paper title is required").isLength({ max: 200 }),
  body("subject").optional({ values: "falsy" }).trim().isLength({ max: 60 }),
  body("class").optional({ values: "falsy" }).trim().isLength({ max: 30 }),
  body("fileUrl")
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Invalid file URL")
    .custom((value: string) => {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      return (
        Boolean(cloudName) &&
        value.startsWith(`https://res.cloudinary.com/${cloudName}/`) &&
        /\/(image|raw)\/upload\//.test(value) &&
        /\.pdf(\?|$)/i.test(value)
      );
    })
    .withMessage("Paper must be a PDF stored in Cloudinary"),
  body("publicId").trim().notEmpty().withMessage("Missing Cloudinary public id"),
  body("resourceType").optional({ values: "falsy" }).isIn(["image", "raw"]),
  body("pages").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("Invalid page count"),
  body("originalName").trim().notEmpty().withMessage("Missing file name").isLength({ max: 255 }),
  body("mimeType").equals("application/pdf").withMessage("Only PDF files are allowed"),
  body("size").isInt({ min: 1 }).withMessage("Invalid file size"),
];

export const paperIdParam = [param("id").isMongoId().withMessage("Invalid paper id")];
export const termIdParam = [param("id").isMongoId().withMessage("Invalid term id")];
