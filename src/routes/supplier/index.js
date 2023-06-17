const express = require("express");
const router = express.Router();
const supplierService = require("../../services/supplier");
const supplyCategoryService = require("../../services/supplyCategory");
const supplySubCategoryService = require("../../services/supplySubCategory");
const supplierProductService = require("../../services/supplierProduct");
const supplierServicesService = require("../../services/supplierService");
const upload = require("../../helpers/fileHelper");
const farmerService = require("../../services/farmer");

/**
 * Get suppliers
 */
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await supplierService.get();

    res.json({ status: "success", data: suppliers });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Gets the suppliers in a particular district
 */
router.get("/search-suppliers-by-district/:district", async (req, res) => {
    try{
      const district = req.params.district;
      const suppliers = await supplierService.getSuppliersInADistrict(district);
      res.json({ status: "success", data: suppliers });
    } catch(e){
      res.json({status: "error", message: e});
    }
});

/**
 * Gets a supplier by Id
 */
router.get("/supplier/:id", async (req, res) => {
  try {
    const supplier = await supplierService.getOne(req.params.id);

    res.json({ status: "success", data: supplier });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Update a supplier's details
 */
router.put("/supplier/:id", async (req, res) => {
  try {
    const supplier = await supplierService.update(req.params.id, req.body);

    res.json({ status: "success", data: supplier });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Deletes a supplier
 */
router.delete("/supplier/:id", async (req, res) => {
  try {
    await supplierService.delete(req.params.id);

    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Get supply categories
 */
router.get("/supply-categories", async (req, res) => {
  try {
    const supplyCategories = await supplyCategoryService.get();

    res.json({ status: "success", data: supplyCategories });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Creates a supply category
 */
router.post("/supply-categories", async (req, res) => {
  try {
    const supplyCategory = await supplyCategoryService.create(req.body);

    res.json({ status: "success", data: supplyCategory });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Update a supplier category details
 */
router.put("/supply-category/:id", async (req, res) => {
  try {
    const supplyCategory = await supplyCategoryService.update(
      req.params.id,
      req.body
    );

    res.json({ status: "success", data: supplyCategory });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Delete a supplier category
 */
router.delete("/supply-category/:id", async (req, res) => {
  try {
    await supplyCategoryService.delete(req.params.id);

    res.json({ status: "success", message: "Supply category deleted." });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Get supply sub categories
 */
router.get("/supply-sub-categories", async (req, res) => {
  try {
    const supplySubCategories = await supplySubCategoryService.get();

    res.json({ status: "success", data: supplySubCategories });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Create a supplier sub category
 */
router.post(
  "/supply-sub-categories",
  upload.single("file"),
  async (req, res) => {
    try {
      const body = req.body;
      const uploadedFile = req.file;
      const payload = { ...body, uploadedFile };
      const supplySubCategory = await supplySubCategoryService.create(payload);

      res.json({ status: "success", data: supplySubCategory });
    } catch (error) {
      res.json({ status: "error", message: error });
    }
  }
);

/**
 * Update a supplier sub category details
 */
router.put("/supply-sub-category/:id", async (req, res) => {
  try {
    const supplySubCategory = await supplySubCategoryService.update(
      req.params.id,
      req.body
    );

    res.json({ status: "success", data: supplySubCategory });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Delete a supply sub category
 */
router.delete("/supply-sub-category/:id", async (req, res) => {
  try {
    await supplySubCategoryService.delete(req.params.id);

    res.json({ status: "success", message: "Supply sub category deleted." });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Get all supplier products
 */
router.get("/supplier-products", async (req, res) => {
  try {
    const supplierProduct = await supplierProductService.get();

    res.json({ status: "success", data: supplierProduct });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Gets a supplier product by ID
 */
router.get("/supplier-product/:id", async (req, res) => {
  try {
    const supplyProduct = await supplierProductService.getSupplierProductById(
      req.params.id
    );

    res.json({ status: "success", data: supplyProduct });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Get a supplier products by sub category id
 */
router.get("/supplier-products-by-sub-category/:id", async (req, res) => {
  try {
    const supplyProducts =
      await supplierProductService.getSupplierProductsBySubCategory(
        req.params.id
      );

    res.json({ status: "success", data: supplyProducts });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Get a supplier products by supplier id
 */
router.get("/supplier-products-by-supplier/:id", async (req, res) => {
  try {
    const supplyProducts =
      await supplierProductService.getSupplierProductsBySupplier(req.params.id);

    res.json({ status: "success", data: supplyProducts });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Creates a supplier products
 */
router.post("/supplier-products", async (req, res) => {
  try {
    const body = req.body;
    console.log(req.body);
    const supplierProduct = await supplierProductService.create(req.body);

    res.json({ status: "success", data: supplierProduct });
  } catch (error) {
    console.log(error)
    res.json({ status: "error", message: error });
  }
});

/**
 * Update a supplier product details
 */
router.put("/supplier-product/:id", async (req, res) => {
  try {
    const supplierProduct = await supplierProductService.update(
      req.params.id,
      req.body
    );

    res.json({ status: "success", data: supplierProduct });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

/**
 * Delete a supplier product
 */
router.delete("/supplier-product/:id", async (req, res) => {
  try {
    await supplierProductService.delete(req.params.id);

    res.json({ status: "success", message: "Supplier product deleted." });
  } catch (error) {
    res.json({ status: "error", message: error });
  }
});

// /**
//  * Get supplier services
//  */
// router.get("/supplier-services", async (req, res) => {
//   try {
//     const supplierServices = await supplierServicesService.get();

//     res.json({ status: "success", data: supplierServices });
//   } catch (error) {
//     res.json({ status: "error", message: error });
//   }
// });

// /**
//  * Creates a supplier service
//  */
// router.post("/supplier-services", upload.single("file"), async (req, res) => {
//   try {
//     const body = req.body;
//     const uploadedFile = req.file ?? null;
//     const payload = uploadedFile ? { ...body, uploadedFile } : body;
//     const supplierService = await supplierServicesService.create(payload);

//     res.json({ status: "success", data: supplierService });
//   } catch (error) {
//     res.json({ status: "error", message: error });
//   }
// });

// /**
//  * Update a supplier service details
//  */
// router.put("/supplier-service/:id", async (req, res) => {
//   try {
//     const supplierService = await supplierServicesService.update(
//       req.params.id,
//       req.body
//     );

//     res.json({ status: "success", data: supplierService });
//   } catch (error) {
//     res.json({ status: "error", message: error });
//   }
// });

// /**
//  * Delete a supplier service
//  */
// router.delete("/supplier-service/:id", async (req, res) => {
//   try {
//     await supplierServicesService.delete(req.params.id);

//     res.json({ status: "success", message: "Supplier service deleted." });
//   } catch (error) {
//     res.json({ status: "error", message: error });
//   }
// });


/**
 * Get farmers by a district
 */
router.get("/search-by-district/", async (req, res) => {
  try {         
    const district = req.query.district;       
    const farmers = await farmerService.getByDistrict(district);
    return res.status(200).json(farmers);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
