import mongoose from "mongoose";
import dotenv from "dotenv";
import CarModel from "../models/CarModel.model";
import Variant from "../models/Variant.model";

dotenv.config();

const queryVariant = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    // Step 1: Find the Mahindra XUV 3XO model
    const carModel = await CarModel.findOne({
      brandName: "Mahindra",
      name: "XUV 3XO"
    });

    if (!carModel) {
      console.log("CarModel not found. Searching with different patterns...");
      
      // Try other patterns
      const allModels = await CarModel.find({ brandName: "Mahindra" }).limit(10);
      console.log("Available Mahindra models:");
      allModels.forEach(m => console.log(`- ${m.name} (id: ${m.id})`));
      
      const xuv3xoModels = await CarModel.find({
        $or: [
          { name: /XUV.*3XO/i },
          { name: /3XO/i }
        ]
      });
      
      if (xuv3xoModels.length > 0) {
        console.log("\nFound XUV 3XO models:");
        xuv3xoModels.forEach(m => {
          console.log(`- ${m.name} (id: ${m.id}, brandName: ${m.brandName})`);
        });
      }
      return;
    }

    console.log(`Found CarModel: ${carModel.name} (id: ${carModel.id})`);

    // Step 2: Find all variants for this model
    const variants = await Variant.find({ modelId: carModel.id });

    if (variants.length === 0) {
      console.log("No variants found for this model");
      return;
    }

    console.log(`\nFound ${variants.length} variant(s) for ${carModel.name}:`);
    console.log("=".repeat(80));
    variants.forEach(variant => {
      console.log(`
Variant Details:
- ID: ${variant.id}
- Name: ${variant.name}
- Price: ${variant.price}
- Fuel Type: ${variant.fuelType}
- Transmission: ${variant.transmission}
- Engine: ${variant.engine}
- Mileage: ${variant.mileage}
- Seating: ${variant.seating}
- Colors: ${variant.colors.join(", ")}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
};

queryVariant();
