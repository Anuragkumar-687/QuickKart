'use strict';

const asyncHandler = require('../lib/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  res.json(await authService.getMe(req.user.id));
});

const updateMe = asyncHandler(async (req, res) => {
  res.json(await authService.updateMe(req.user.id, req.body));
});

module.exports = { register, login, me, updateMe };
