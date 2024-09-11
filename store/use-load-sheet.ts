import { create } from "zustand";

interface TBill {
    id: string;
    accessId: number;
    createdAt: Date;
    isReturned: boolean
}

export interface LoadSheetStore {
    messages: string[] | undefined
    isFetching: boolean
    saleManId: string
    areaId: string
    bills: TBill[] | undefined;
    setSaleManId: (saleManId: string) => void
    setAreaId: (areaId: string) => void
    setBills: (items: TBill[] | undefined) => void
    setFetching: (isFetching: boolean) => void
    setMessages: (message: string[] | undefined) => void
}

const useLoadSheet = create<LoadSheetStore>((set, get) => ({
    messages: [],
    isFetching: false,
    saleManId: "",
    areaId: "",
    bills: [],
    setMessages: (messages) => set((state) => ({ messages })),
    setFetching: (isFetching) => set((state) => ({ isFetching })),
    setSaleManId: (saleManId) => set((state) => ({ saleManId })),
    setAreaId: (areaId) => set((state) => ({ areaId })),
    setBills: (bills) => set((state) => ({ bills })),
}));

export default useLoadSheet;
