"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaEntry = exports.updateMediaEntry = exports.createMediaEntry = exports.getMediaByKey = exports.getAllMedia = void 0;
const MediaMap_model_1 = __importDefault(require("../models/MediaMap.model"));
const getAllMedia = async (req, res) => {
    try {
        const result = await MediaMap_model_1.default.find();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch media map" });
    }
};
exports.getAllMedia = getAllMedia;
const getMediaByKey = async (req, res) => {
    try {
        const item = await MediaMap_model_1.default.findOne({ key: req.params.key });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch media entry" });
    }
};
exports.getMediaByKey = getMediaByKey;
const createMediaEntry = async (req, res) => {
    try {
        const item = await MediaMap_model_1.default.create(req.body);
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create media entry" });
    }
};
exports.createMediaEntry = createMediaEntry;
const updateMediaEntry = async (req, res) => {
    try {
        const item = await MediaMap_model_1.default.findOneAndUpdate({ key: req.params.key }, req.body, { new: true });
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update media entry" });
    }
};
exports.updateMediaEntry = updateMediaEntry;
const deleteMediaEntry = async (req, res) => {
    try {
        await MediaMap_model_1.default.findOneAndDelete({ key: req.params.key });
        res.json({ message: "Media entry deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete media entry" });
    }
};
exports.deleteMediaEntry = deleteMediaEntry;
