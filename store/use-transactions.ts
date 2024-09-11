import { addDays } from "date-fns";
import { create } from "zustand";

type Transactions = {
    id: string;
    accessId: number;
    createdAt: Date;
}

type TShops = {
    id: string;
    name: string | null;
};


export interface TransactionStore {
    isFetching: boolean
    transactionId: string
    bookerId: string
    saleManId: string
    areaId: string
    shopId: string
    companyId: string
    deliveryDate: Date | string
    issueDate: Date | string
    transactions: Transactions[] | undefined;
    shops: TShops[] | undefined
    setBookerId: (bookerId: string) => void
    setSaleManId: (saleManId: string) => void
    setAreaId: (areaId: string) => void
    setShopId: (shopId: string) => void
    setCompanyId: (companyId: string) => void
    setDeliveryDate: (deliveryDate: Date) => void
    setIssueDate: (issueDate: Date) => void
    setTransactions: (items: Transactions[] | undefined) => void
    setTransactionId: (id: string) => void
    setShops: (shops: TShops[] | undefined) => void
    setFetching: (isFetching: boolean) => void
}

const useTransaction = create<TransactionStore>((set, get) => ({
    isFetching: false,
    transactionId: "",
    bookerId: "",
    saleManId: "",
    areaId: "",
    shopId: "",
    companyId: "",
    deliveryDate: "",
    issueDate: "",
    shops: [],
    companies: [],
    transactions: [],
    setFetching: (isFetching) => set((state) => ({ isFetching })),
    setBookerId: (bookerId) => set((state) => ({ bookerId })),
    setSaleManId: (saleManId) => set((state) => ({ saleManId })),
    setAreaId: (areaId) => set((state) => ({ areaId })),
    setShopId: (shopId) => set((state) => ({ shopId })),
    setCompanyId: (companyId) => set((state) => ({ companyId })),
    setDeliveryDate: (deliveryDate) => set((state) => ({ deliveryDate })),
    setIssueDate: (issueDate) => set((state) => ({ issueDate })),
    setTransactions: (transactions) => set((state) => ({ transactions })),
    setShops: (shops) => set((state) => ({ shops })),
    setTransactionId: (transactionId) => set((state) => ({ transactionId })),
}));

export default useTransaction;
