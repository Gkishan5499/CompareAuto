import { Schema, model, Document } from 'mongoose';

// 1. Updated Interface – your grouped fields + dynamic fallback
export interface ICarSpecs extends Document {
  variantId: string;
  vehicleCategory?: "car" | "bike";
  wheels?: 2 | 4;

  // Existing clean groups
  overview?: {
    description?: string;
    summary?: string;
  };

  engine?: {
    engine_cc?: string;
    engine_type?: string;
    cylinders?: string;
    turbocharger?: string;
    hybrid?: string;
    battery?: string;
    motor?: string;
    emissionStandard?: string;
  };

  performance?: {
    mileage?: string;
    drivingRange?: string;
    idleStartStop?: string;
    drivetrain?: string;
    transmission?: string;
  };

  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    kerbWeight?: string;
    groundClearance?: string;
    grossWeight?: string;
  };

  safety?: {
    airbags?: string;
    ncapRating?: string;
    abs?: string;
    ebd?: string;
    esp?: string;
    tractionControl?: string;
    hillHold?: string;
    hillDescent?: string;
    childSeatAnchor?: string;
  };

  comfort?: {
    ac?: string;
    rearAC?: string;
    cruiseControl?: string;
    steeringAdjustment?: string;
    parkingSensors?: string;
  };

  lighting?: {
    headlamps?: string;
    drl?: string;
    taillamps?: string;
    foglamps?: string;
  };

  exterior?: {
    monotone_color_names?: string[]; // Available exterior colors
    colors?: string[]; // Alias for colors
  };

  media?: {
    hero?: string;
    gallery?: string[];
  };

  interior?: {
    upholstery?: string;
    dashboard?: string;
    colorTheme?: string;
    armrests?: string;
  };

  tech?: {
    infotainment?: string;
    speakers?: string;
    androidAuto?: string;
    appleCarPlay?: string;
    bluetooth?: string;
  };

  clusterDisplay?: {
    screenType?: string;
    avgFuel?: string;
    distanceToEmpty?: string;
    digitalSpeedo?: string;
  };

  storage?: {
    bottleHolders?: string;
    cupHolders?: string;
    bootSpace?: string;
  };

  warranty?: {
    vehicleWarranty?: string;
    batteryWarranty?: string;
  };

  // ⭐ NEW ADDITION:
  // This allows storing ALL 300+ new fields dynamically
  [key: string]: any;

  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema – strict:false allows ALL new fields to be saved without defining them
const CarSpecsSchema = new Schema<ICarSpecs>(
  {
    variantId: { type: String, required: true, unique: true },
    vehicleCategory: { type: String, enum: ["car", "bike"], default: "car" },
    wheels: { type: Number, enum: [2, 4], default: 4 },

    overview: {
      description: String,
      summary: String,
    },

    engine: {
      engine_cc: String,
      engine_type: String,
      cylinders: String,
      turbocharger: String,
      hybrid: String,
      battery: String,
      motor: String,
      emissionStandard: String,
    },

    performance: {
      mileage: String,
      drivingRange: String,
      idleStartStop: String,
      drivetrain: String,
      transmission: String,
    },

    dimensions: {
      length: String,
      width: String,
      height: String,
      wheelbase: String,
      kerbWeight: String,
      groundClearance: String,
      grossWeight: String,
    },

    safety: {
      airbags: String,
      ncapRating: String,
      abs: String,
      ebd: String,
      esp: String,
      tractionControl: String,
      hillHold: String,
      hillDescent: String,
      childSeatAnchor: String,
    },

    comfort: {
      ac: String,
      rearAC: String,
      cruiseControl: String,
      steeringAdjustment: String,
      parkingSensors: String,
    },

    lighting: {
      headlamps: String,
      drl: String,
      taillamps: String,
      foglamps: String,
    },

    exterior: {
      monotone_color_names: [String],
      colors: [String],
    },

    media: {
      hero: String,
      gallery: [String],
    },

    interior: {
      upholstery: String,
      dashboard: String,
      colorTheme: String,
      armrests: String,
    },

    tech: {
      infotainment: String,
      speakers: String,
      androidAuto: String,
      appleCarPlay: String,
      bluetooth: String,
    },

    clusterDisplay: {
      screenType: String,
      avgFuel: String,
      distanceToEmpty: String,
      digitalSpeedo: String,
    },

    storage: {
      bottleHolders: String,
      cupHolders: String,
      bootSpace: String,
    },

    warranty: {
      vehicleWarranty: String,
      batteryWarranty: String,
    },

    // ⭐ NEW: Accept ANY new fields dynamically
  },
  {
    timestamps: true,
    strict: false, // <-- KEY LINE: Allows extra fields (ALL your new columns)
  }
);

// 3. Export Model
export default model<ICarSpecs>("CarSpecs", CarSpecsSchema);
