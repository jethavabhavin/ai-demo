// scripts/seed.ts
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI as string
// scripts/products100.ts

const initialProducts = [
   { name: 'Classic Cotton T-Shirt', status: true, price: 349 },
   { name: 'Slim Fit Denim Jeans', status: true, price: 1299 },
   { name: 'Leather Wallet', status: true, price: 799 },
   { name: 'Wireless Bluetooth Earbuds', status: true, price: 2499 },
   { name: 'Stainless Steel Water Bottle', status: true, price: 449 },
   { name: 'Running Shoes - Sport Edition', status: true, price: 2999 },
   { name: 'Formal White Shirt', status: false, price: 899 },
   { name: 'Smart Fitness Band', status: true, price: 1999 },
   { name: 'Canvas Backpack', status: true, price: 1599 },
   { name: 'Noise Cancelling Headphones', status: true, price: 4999 },
   { name: 'Ceramic Coffee Mug Set', status: true, price: 599 },
   { name: 'Yoga Mat - Premium', status: true, price: 899 },
   { name: 'Analog Wrist Watch', status: false, price: 3499 },
   { name: 'Portable Power Bank 10000mAh', status: true, price: 1299 },
   { name: 'Cotton Bedsheet Set', status: true, price: 1799 },
   { name: 'Wireless Mouse', status: true, price: 599 },
   { name: 'Mechanical Keyboard', status: true, price: 3299 },
   { name: 'Sunglasses - UV Protection', status: true, price: 999 },
   { name: 'Leather Office Bag', status: true, price: 2199 },
   { name: 'Smartphone Tripod Stand', status: true, price: 549 },
   { name: 'Electric Kettle 1.5L', status: true, price: 1099 },
   { name: 'Non-Stick Frying Pan', status: true, price: 799 },
   { name: 'Bluetooth Speaker - Portable', status: true, price: 1899 },
   { name: 'Wool Winter Jacket', status: false, price: 3999 },
   { name: 'Kids Storybook Set', status: true, price: 649 },
   { name: 'Desk Lamp - LED', status: true, price: 799 },
   { name: 'Office Chair - Ergonomic', status: true, price: 6999 },
   { name: 'Gaming Mouse Pad - XL', status: true, price: 499 },
   { name: 'Travel Duffel Bag', status: true, price: 1699 },
   { name: 'Digital Kitchen Scale', status: true, price: 699 },
   { name: 'Cotton Bath Towel Set', status: true, price: 899 },
   { name: 'Laptop Sleeve - 15 inch', status: true, price: 799 },
   { name: 'Smart LED Bulb', status: true, price: 349 },
   { name: 'Portable Blender', status: false, price: 1499 },
   { name: "Men's Formal Trousers", status: true, price: 1199 },
   { name: "Women's Handbag", status: true, price: 1899 },
   { name: 'Kids Sneakers', status: true, price: 999 },
   { name: 'Wireless Charger Pad', status: true, price: 899 },
   { name: 'Air Fryer - 4L', status: true, price: 5999 },
   { name: 'Ceramic Dinner Set', status: true, price: 2499 },
   { name: 'Table Fan - 16 inch', status: true, price: 1299 },
   { name: 'Cotton Pajama Set', status: true, price: 699 },
   { name: 'Trimmer - Rechargeable', status: true, price: 999 },
   { name: 'Hair Dryer - 1200W', status: false, price: 799 },
   { name: 'Kids School Bag', status: true, price: 899 },
   { name: 'Wooden Photo Frame', status: true, price: 299 },
   { name: 'Study Table - Compact', status: true, price: 3499 },
   { name: 'Bookshelf - 5 Tier', status: true, price: 2999 },
   { name: 'Umbrella - Windproof', status: true, price: 449 },
   { name: 'Raincoat - Waterproof', status: true, price: 799 },
   { name: 'Cycling Helmet', status: true, price: 1199 },
   { name: 'Football - Size 5', status: true, price: 699 },
   { name: 'Badminton Racket Set', status: true, price: 1299 },
   { name: 'Cricket Bat - Willow', status: false, price: 1899 },
   { name: 'Skipping Rope', status: true, price: 249 },
   { name: 'Dumbbells Set - 10kg', status: true, price: 1999 },
   { name: 'Resistance Bands Set', status: true, price: 599 },
   { name: 'Protein Shaker Bottle', status: true, price: 349 },
   { name: 'Gym Gloves', status: true, price: 399 },
   { name: 'Track Pants', status: true, price: 799 },
   { name: 'Sports Cap', status: true, price: 349 },
   { name: 'Wall Clock - Wooden', status: true, price: 899 },
   { name: 'Curtains - Blackout', status: true, price: 1499 },
   { name: 'Door Mat - Anti Slip', status: false, price: 349 },
   { name: 'Storage Boxes Set of 3', status: true, price: 899 },
   { name: 'Laundry Basket', status: true, price: 599 },
   { name: 'Shoe Rack - 4 Tier', status: true, price: 1599 },
   { name: 'Cushion Covers Set', status: true, price: 499 },
   { name: 'Table Runner', status: true, price: 349 },
   { name: 'Wall Sticker - Decorative', status: true, price: 249 },
   { name: 'Mosquito Net', status: true, price: 799 },
   { name: 'Electric Iron', status: true, price: 1199 },
   { name: 'Vacuum Cleaner - Handheld', status: false, price: 3499 },
   { name: 'Water Purifier - RO', status: true, price: 8999 },
   { name: 'Microwave Oven - 20L', status: true, price: 6499 },
   { name: 'Toaster - 2 Slice', status: true, price: 999 },
   { name: 'Induction Cooktop', status: true, price: 1999 },
   { name: 'Pressure Cooker - 5L', status: true, price: 1499 },
   { name: 'Rice Cooker - 1.8L', status: true, price: 1799 },
   { name: 'Sandwich Maker', status: false, price: 999 },
   { name: 'Juicer Mixer Grinder', status: true, price: 2999 },
   { name: 'Refrigerator Cover', status: true, price: 349 },
   { name: 'Washing Machine Cover', status: true, price: 399 },
   { name: 'Bean Bag - Large', status: true, price: 2499 },
   { name: 'Recliner Chair', status: true, price: 12999 },
   { name: 'Dining Table Set - 4 Seater', status: false, price: 15999 },
   { name: 'Mattress - Queen Size', status: true, price: 8999 },
   { name: 'Pillow Set of 2', status: true, price: 599 },
   { name: 'Blanket - Double Bed', status: true, price: 1199 },
   { name: 'Baby Diapers Pack', status: true, price: 599 },
   { name: 'Baby Stroller', status: true, price: 5999 },
   { name: 'Feeding Bottle Set', status: true, price: 499 },
   { name: 'Baby Carrier', status: false, price: 1499 },
   { name: 'Kids Tricycle', status: true, price: 2499 },
   { name: 'Board Game - Family Pack', status: true, price: 899 },
   { name: 'Puzzle Set - 1000 pcs', status: true, price: 599 },
   { name: 'Remote Control Car', status: true, price: 1299 },
   { name: 'Building Blocks Set', status: true, price: 999 },
   { name: 'Art Supplies Kit', status: true, price: 699 },
   { name: 'Guitar - Acoustic', status: false, price: 4999 },
   { name: 'Keyboard - Musical 61 Key', status: true, price: 7999 },
]
async function seed() {
   const client = new MongoClient(uri)
   try {
      await client.connect()
      const db = client.db('productCollection')
      const collection = db.collection('products')
      await collection.deleteMany({})
      console.log('Cleared existing products')

      const result = await collection.insertMany(initialProducts)
      console.log(`Inserted ${result.insertedCount} products`)
   } catch (err) {
      console.error('Seed failed:', err)
   } finally {
      await client.close()
   }
}

seed()
