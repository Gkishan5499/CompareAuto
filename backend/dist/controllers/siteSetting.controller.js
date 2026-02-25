"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSetting = exports.upsertSetting = exports.getSettingByKey = exports.getAllSettings = void 0;
const SiteSetting_model_1 = __importDefault(require("../models/SiteSetting.model"));
const getAllSettings = async (req, res) => {
    try {
        const settings = await SiteSetting_model_1.default.find();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};
exports.getAllSettings = getAllSettings;
const getSettingByKey = async (req, res) => {
    try {
        const setting = await SiteSetting_model_1.default.findOne({ key: req.params.key });
        if (!setting)
            return res.status(404).json({ message: "Setting not found" });
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch setting" });
    }
};
exports.getSettingByKey = getSettingByKey;
const upsertSetting = async (req, res) => {
    try {
        const { key, value, type, description } = req.body;
        const setting = await SiteSetting_model_1.default.findOneAndUpdate({ key }, { value, type, description }, { new: true, upsert: true });
        res.json(setting);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to save setting" });
    }
};
exports.upsertSetting = upsertSetting;
const deleteSetting = async (req, res) => {
    try {
        await SiteSetting_model_1.default.findOneAndDelete({ key: req.params.key });
        res.json({ message: "Setting deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete setting" });
    }
};
exports.deleteSetting = deleteSetting;
