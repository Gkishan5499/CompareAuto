"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/scripts/migrate-images.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const PUBLIC_DIR = path_1.default.join(__dirname, "..", "..", "public");
const UPLOADS_DIR = path_1.default.join(__dirname, "..", "..", "uploads"); // mapping file will be stored here
if (!fs_1.default.existsSync(UPLOADS_DIR))
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
const foldersToUpload = [
    "brands",
    "cars",
    "gallery",
    "hero",
    "ads",
    "360",
    "uploads", // include your local uploads too
];
const mappingFile = path_1.default.join(UPLOADS_DIR, "mapping.json");
async function walkFiles(folderPath) {
    const results = [];
    if (!fs_1.default.existsSync(folderPath))
        return results;
    const items = fs_1.default.readdirSync(folderPath);
    for (const item of items) {
        const full = path_1.default.join(folderPath, item);
        const stat = fs_1.default.statSync(full);
        if (stat.isDirectory()) {
            const child = await walkFiles(full);
            results.push(...child);
        }
        else if (stat.isFile()) {
            // consider common image extensions only
            const ext = path_1.default.extname(item).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
                results.push(full);
            }
        }
    }
    return results;
}
async function main() {
    console.log("Starting Cloudinary migration...");
    const mapping = fs_1.default.existsSync(mappingFile)
        ? JSON.parse(fs_1.default.readFileSync(mappingFile, "utf8"))
        : {};
    for (const folder of foldersToUpload) {
        const folderPath = path_1.default.join(PUBLIC_DIR, folder);
        console.log("Scanning folder:", folderPath);
        const files = await walkFiles(folderPath);
        console.log(`Found ${files.length} files in ${folder}`);
        for (const fullPath of files) {
            // compute local relative path as stored in DB (e.g. /brands/foo.png or brands/foo.png)
            let rel = path_1.default.relative(PUBLIC_DIR, fullPath).split(path_1.default.sep).join("/"); // brands/foo.png
            const localKeyA = `/${rel}`; // maybe DB uses /brands/foo.png
            const localKeyB = rel; // maybe DB uses brands/foo.png
            // skip if already uploaded (present in mapping)
            if (mapping[localKeyA] || mapping[localKeyB]) {
                console.log("Already uploaded:", localKeyA);
                continue;
            }
            try {
                console.log("Uploading:", fullPath);
                const result = await cloudinary_1.v2.uploader.upload(fullPath, {
                    folder: `site-migration/${path_1.default.dirname(rel)}`.replace(/\\/g, "/"),
                    use_filename: true,
                    unique_filename: false,
                    overwrite: false,
                    resource_type: "image",
                });
                const entry = {
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
                fs_1.default.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2), "utf8");
                console.log("Uploaded ->", result.secure_url);
            }
            catch (err) {
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
