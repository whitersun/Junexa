import {
    ChartNoAxesCombined,
    ChefHat,
    Coffee,
    Flame,
    IceCreamBowl,
    LayoutGrid,
    Leaf,
    Pizza,
    ReceiptText,
    Wallet,
    UtensilsCrossed,
} from "lucide-react";
import type { Product } from "./data";
export const categories = [
    ["Tất cả", UtensilsCrossed],
    ["Burger", Flame],
    ["Pizza", Pizza],
    ["Món chính", ChefHat],
    ["Ăn nhẹ", Leaf],
    ["Đồ uống", Coffee],
    ["Tráng miệng", IceCreamBowl],
] as const;
export const emptyProduct: Product = {
    id: "",
    name: "",
    category: "Món chính",
    price: 49000,
    description: "",
    image: "",
    available: true,
};
export const nav = [
    ["dashboard", "Tổng quan", ChartNoAxesCombined],
    ["menu", "Thực đơn", LayoutGrid],
    ["bills", "Hóa đơn", ReceiptText],
    ["finance", "Sao kê", Wallet],
] as const;
