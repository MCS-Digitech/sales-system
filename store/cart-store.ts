import { create } from "zustand";

type CartItem = {
    id: string | undefined;
    title: string | undefined | null;
    regularPrice: number | null | undefined;
    salePrice: number | null | undefined;
    purchaseLimit: number | null | undefined
    image: string | null | undefined
    qty?: number;
    discount?: number;
    subtotal?: number;
};

export interface CartStore {
    items: CartItem[];
    discount: number;
    total: number;
    addressId: string
    n: (value: number | undefined | null) => number
    setAddress: (id: string) => void
    addToCart: (item: CartItem) => void;
    getCartItem: (id: string | undefined) => CartItem | undefined
    calculateDiscount: (items: CartItem[]) => number
    calculateTotal: (items: CartItem[]) => number
    removeProductToCart: (id: string | undefined) => void
    decrementToCart: (id: string | undefined) => void
    calculateItemDiscount: (regularPrice: CartItem['regularPrice'], salePrice: CartItem['salePrice']) => number
    calculateItemSubtotal: (regularPrice: CartItem['salePrice'], salePrice: CartItem['regularPrice']) => number
}

const useCart = create<CartStore>((set, get) => ({
    items: [],
    discount: 0,
    total: 0,
    addressId: "",
    /**
     * 
     * @param id as Give user selected address
     * @returns 
     */
    setAddress: (id) => set(state => ({ addressId: id })),
    /**
     * 
     * @param r as regularPrice
     * @param s as salePrice
     * @returns regularPrice - salePrice
     * 
     */
    calculateItemDiscount: (r, s) => get().n(r) - get().n(s),
    /**
     * 
     * @param s as salePrice
     * @param r as regularPrice
     * @returns regularPrice Or salePrice
     * 
     */
    calculateItemSubtotal: (s, r) => get().n(s) ?? get().n(r),
    /**
     * 
     * @param value any but only number Or string
     * @returns number
     * 
     */
    n: (value) => Number(value),
    /**
     * 
     * getCartItem function for 
     * get item Or find item into 
     * cart.
     * 
     */
    getCartItem: (id) => get().items.find(i => i.id === id),
    /**
     * 
     * calculateDiscount function is 
     * calculate each discounts of item
     * 
     */
    calculateDiscount: (items) => items.reduce((p, n) => p + get().n(n.discount), 0),
    /**
     * 
     * calculateTotal function is
     * calculate each subtotal of item
     * 
     */
    calculateTotal: (items) => items.reduce((p, n) => p + get().n(n.subtotal), 0),
    /**
     * 
     * addToCart function is get and item
     * and if this item is already exist into
     * cart then update item quantity and
     * update item discount and subtotal and
     * cart laval discount and total
     * 
     */
    addToCart: (newItem) => {
        if (get().getCartItem(newItem.id)) {
            set((state) => ({
                items: state.items.map(p => p.id === newItem.id ? {
                    ...newItem,
                    qty: get().n(p.qty) + 1,
                    subtotal: (get().n(p.qty) + 1) * (get().calculateItemSubtotal(newItem.salePrice, newItem.regularPrice) - get().calculateItemDiscount(newItem.regularPrice, newItem.salePrice)),
                    discount: (get().n(p.qty) + 1) * get().calculateItemDiscount(newItem.regularPrice, newItem.salePrice)
                } : p)
            }))
            set((state) => ({ discount: get().calculateDiscount(state.items), total: get().calculateTotal(state.items) }))
            return
        }
        set((state) => ({
            items: [...state.items, {
                ...newItem,
                qty: 1,
                subtotal: 1 * (get().calculateItemSubtotal(newItem.salePrice, newItem.regularPrice) - get().calculateItemDiscount(newItem.regularPrice, newItem.salePrice)),
                discount: 1 * get().calculateItemDiscount(newItem.regularPrice, newItem.salePrice)
            }]
        }))
        set((state) => ({ discount: get().calculateDiscount(state.items), total: get().calculateTotal(state.items) }))
    },
    /**
     * decrementToCart function is
     * decrease item quantity and reCalculate
     * item discount and subtotal and cart
     * laval discount and total
     * 
     */
    decrementToCart: (id) => {
        if (get().getCartItem(id)?.qty === 1) {
            return get().removeProductToCart(id)
        }
        set((state) => ({
            items: state.items.map(i => i.id === id ? {
                ...i,
                qty: get().n(i.qty) - 1,
                subtotal: (get().n(i.qty) - 1) * (get().calculateItemSubtotal(i.salePrice, i.regularPrice) - get().calculateItemDiscount(i.regularPrice, i.salePrice)),
                discount: (get().n(i.qty) - 1) * get().calculateItemDiscount(i.regularPrice, i.salePrice)
            } : i)
        }))
        set((state) => ({ discount: get().calculateDiscount(state.items), total: get().calculateTotal(state.items) }))
    },
    /**
     * 
     * removeProductToCart function will
     * remove item based on item id and recalculate
     * cart laval discount and total
     * 
     */
    removeProductToCart: (id) => {
        set((state) => ({ items: state.items.filter(p => p.id != id) }))
        set((state) => ({ discount: get().calculateDiscount(state.items), total: get().calculateTotal(state.items) }))
    }
}));

export default useCart;
