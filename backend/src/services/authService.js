'use strict';

const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');
const ApiError = require('../lib/ApiError');
const { signToken } = require('../lib/token');
const { deriveRegion } = require('../lib/regions');

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    state: u.state,
    city: u.city,
    pincode: u.pincode,
    region: u.region,
  };
}

async function register({ name, email, password, state, city, pincode }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hashed = await bcrypt.hash(password, 10);
  const region = deriveRegion(state); // auto-derive region from state

  const user = await prisma.user.create({
    data: { name, email, password: hashed, state, city, pincode, region },
  });

  const token = signToken({ id: user.id, role: user.role });
  return { token, user: publicUser(user) };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.badRequest('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw ApiError.badRequest('Invalid credentials');

  const token = signToken({ id: user.id, role: user.role });
  return { token, user: publicUser(user) };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return publicUser(user);
}

async function updateMe(userId, data) {
  const patch = { ...data };
  // Re-derive region whenever the state changes.
  if (data.state !== undefined) patch.region = deriveRegion(data.state);

  const user = await prisma.user.update({ where: { id: userId }, data: patch });
  return publicUser(user);
}

module.exports = { register, login, getMe, updateMe, publicUser };
