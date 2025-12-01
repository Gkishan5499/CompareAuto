// backend/src/scripts/migrate-images.ts
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");
const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads"); // mapping file will be stored here
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const foldersToUpload = [
  "brands",
  "cars",
  "gallery",
  "hero",
  "ads",
  "360",
  "uploads", // include your local uploads too
];

type MappingEntry = {
  localPath: string;   // e.g. /brands/maruti-suzuki.png or brands/maruti-suzuki.png
  cloudUrl: string;    // secure_url from cloudinary
  public_id: string;   // cloudinary public id
  uploadedAt: string;
  size?: number;
};

const mappingFile = path.join(UPLOADS_DIR, "mapping.json");

async function walkFiles(folderPath: string): Promise<string[]> {
  const results: string[] = [];
  if (!fs.existsSync(folderPath)) return results;
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const full = path.join(folderPath, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      const child = await walkFiles(full);
      results.push(...child);
    } else if (stat.isFile()) {
      // consider common image extensions only
      const ext = path.extname(item).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

async function main() {
  console.log("Starting Cloudinary migration...");
  const mapping: Record<string, MappingEntry> = fs.existsSync(mappingFile)
    ? JSON.parse(fs.readFileSync(mappingFile, "utf8"))
    : {};

  for (const folder of foldersToUpload) {
    const folderPath = path.join(PUBLIC_DIR, folder);
    console.log("Scanning folder:", folderPath);
    const files = await walkFiles(folderPath);
    console.log(`Found ${files.length} files in ${folder}`);

    for (const fullPath of files) {
      // compute local relative path as stored in DB (e.g. /brands/foo.png or brands/foo.png)
      let rel = path.relative(PUBLIC_DIR, fullPath).split(path.sep).join("/"); // brands/foo.png
      const localKeyA = `/${rel}`; // maybe DB uses /brands/foo.png
      const localKeyB = rel;       // maybe DB uses brands/foo.png

      // skip if already uploaded (present in mapping)
      if (mapping[localKeyA] || mapping[localKeyB]) {
        console.log("Already uploaded:", localKeyA);
        continue;
      }

      try {
        console.log("Uploading:", fullPath);
        const result = await cloudinary.uploader.upload(fullPath, {
          folder: `site-migration/${path.dirname(rel)}`.replace(/\\/g, "/"),
          use_filename: true,
          unique_filename: false,
          overwrite: false,
          resource_type: "image",
        });

        const entry: MappingEntry = {
          localPath: localKeyA,
          cloudUrl: result.secure_url,
          public_id: result.public_id,
          uploadedAt: new Date().toISOString(),
          size: result.bytes,
        };

        // store mapping under both /path and path keys
        mapping[localKeyA] = entry;
        mapping[localKeyB] = entry;

        // persist mapping file incrementally to avoid large loss
        fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2), "utf8");

        console.log("Uploaded ->", result.secure_url);
      } catch (err) {
        console.error("Upload failed:", fullPath, err);
      }
    }
  }

  console.log("Migration complete. Mapping file saved to:", mappingFile);
}

main().catch((e) => {
  console.error("Migration script failed:", e);
  process.exit(1);
});
