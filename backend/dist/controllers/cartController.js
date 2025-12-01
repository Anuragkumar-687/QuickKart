"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCart = exports.addToCart = exports.getCart = void 0;
const server_1 = require("../server");
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const cart = yield server_1.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        res.json(cart || { items: [] });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
});
exports.getCart = getCart;
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        let cart = yield server_1.prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = yield server_1.prisma.cart.create({
                data: { userId },
            });
        }
        const existingItem = yield server_1.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });
        if (existingItem) {
            yield server_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }
        else {
            yield server_1.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }
        const updatedCart = yield server_1.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        res.json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error });
    }
});
exports.addToCart = addToCart;
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params; // CartItem ID
        const cart = yield server_1.prisma.cart.findUnique({ where: { userId } });
        if (!cart)
            return res.status(404).json({ message: 'Cart not found' });
        yield server_1.prisma.cartItem.delete({ where: { id } });
        const updatedCart = yield server_1.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        res.json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error });
    }
});
exports.removeFromCart = removeFromCart;
