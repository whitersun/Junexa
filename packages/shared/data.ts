export type Product = {
    translations?: Partial<
        Record<"en" | "zh-TW", { name?: string; description?: string }>
    >;
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    image: string;
    available: boolean;
    badge?: string;
};
export type Bill = {
    id: string;
    customer: string;
    items: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
        translations?: Product["translations"];
    }[];
    total: number;
    status: "pending" | "paid" | "cancelled";
    method: string;
    createdAt: string;
};
export type Store = { products: Product[]; bills: Bill[] };
const photo = (id: string) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;
export const initialProducts: Product[] = [
    {
        id: "p1",
        name: "Burger bò phô mai",
        category: "Burger",
        price: 89000,
        description: "Bò nướng mọng nước, cheddar & sốt đặc biệt",
        image: photo("photo-1568901346375-23c9450c58cd"),
        available: true,
        badge: "Bán chạy",
    },
    {
        id: "p2",
        name: "Pizza Margherita",
        category: "Pizza",
        price: 129000,
        description: "Mozzarella, cà chua tươi & lá basil",
        image: photo("photo-1579751626657-72bc17010498"),
        available: true,
        badge: "Yêu thích",
    },
    {
        id: "p3",
        name: "Salad vườn xanh",
        category: "Ăn nhẹ",
        price: 69000,
        description: "Rau xanh tươi, bơ & sốt mè rang",
        image: photo("photo-1512621776951-a57141f2eefd"),
        available: true,
    },
    {
        id: "p4",
        name: "Mì Ý sốt bò bằm",
        category: "Món chính",
        price: 99000,
        description: "Pasta al dente cùng sốt Bolognese đậm đà",
        image: photo("photo-1551892374-ecf8754cf8b0"),
        available: true,
    },
    {
        id: "p5",
        name: "Cà phê latte",
        category: "Đồ uống",
        price: 45000,
        description: "Espresso thơm nồng, sữa tươi béo mịn",
        image: photo("photo-1461023058943-07fcbe16d735"),
        available: true,
        badge: "Must try",
    },
    {
        id: "p6",
        name: "Pancake trái cây",
        category: "Tráng miệng",
        price: 69000,
        description: "Bánh mềm xốp, trái cây tươi & mật ong",
        image: photo("photo-1528207776546-365bb710ee93"),
        available: true,
    },
    {
        id: "p7",
        name: "Khoai tây chiên",
        category: "Ăn nhẹ",
        price: 39000,
        description: "Giòn rụm bên ngoài, mềm thơm bên trong",
        image: photo("photo-1573080496219-bb080dd4f877"),
        available: true,
    },
    {
        id: "p8",
        name: "Trà đào cam sả",
        category: "Đồ uống",
        price: 49000,
        description: "Trà thanh mát với đào và cam tươi",
        image: photo("photo-1556679343-c7306c1976bc"),
        available: true,
    },
];
export const money = (n: number) =>
    new Intl.NumberFormat("vi-VN").format(n) + "đ";
