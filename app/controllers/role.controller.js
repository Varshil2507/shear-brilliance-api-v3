const db = require("../models");
const Role = db.roles;
const sendResponse = require("../helpers/responseHelper"); // Import sendResponse helper


exports.create = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        sendResponse(res, true, "Role created successfully", role, 201);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

exports.findAll = async (req, res) => {
    try {
        const roles = await Role.findAll();
        sendResponse(res, true, "Retrieved all roles successfully", roles, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

exports.findOne = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return sendResponse(res, false, "Role not found", null, 404);
        }
        sendResponse(res, true, "Role retrieved successfully", role, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

exports.update = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return sendResponse(res, false, "Role not found", null, 404);
        }
        await role.update(req.body);
        sendResponse(res, true, "Role updated successfully", role, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};

exports.delete = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return sendResponse(res, false, "Role not found", null, 404);
        }
        await role.destroy();
        sendResponse(res, true, "Role deleted successfully", null, 200);
    } catch (error) {
        sendResponse(res, false, error.message, null, 500);
    }
};
