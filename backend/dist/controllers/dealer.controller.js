"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDealer = exports.updateDealer = exports.createDealer = exports.getDealerById = exports.getAllDealers = void 0;
const Dealer_model_1 = __importDefault(require("../models/Dealer.model"));
const getAllDealers = async (req, res) => {
    try {
        const dealers = await Dealer_model_1.default.find().sort({ name: 1 });
        res.json(dealers);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch dealers" });
    }
};
exports.getAllDealers = getAllDealers;
const getDealerById = async (req, res) => {
    try {
        const dealer = await Dealer_model_1.default.findOne({ id: req.params.id });
        if (!dealer)
            return res.status(404).json({ message: "Dealer not found" });
        res.json(dealer);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch dealer" });
    }
};
exports.getDealerById = getDealerById;
const createDealer = async (req, res) => {
    try {
        const dealer = await Dealer_model_1.default.create(req.body);
        res.json(dealer);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create dealer" });
    }
};
exports.createDealer = createDealer;
const updateDealer = async (req, res) => {
    try {
        const dealer = await Dealer_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(dealer);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update dealer" });
    }
};
exports.updateDealer = updateDealer;
const deleteDealer = async (req, res) => {
    try {
        await Dealer_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Dealer deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete dealer" });
    }
};
exports.deleteDealer = deleteDealer;
