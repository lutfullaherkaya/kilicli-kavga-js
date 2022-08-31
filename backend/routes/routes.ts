// import express
import express from "express";

import Oyuncu from "../controllers/oyuncu.js";

const router = express.Router();
router.get('/oyuncular', Oyuncu.listele);
router.post('/oyuncular', Oyuncu.olustur);
router.delete('/oyuncular/:isim', Oyuncu.sil);

/*
// Get All Product


// Get Single Product
router.get('/products/:id', showProductById);

// Create New Product

// Update Product
router.put('/products/:id', updateProduct);

// Delete Product
router.delete('/products/:id', deleteProduct);
*/

// export default router
export default router;
