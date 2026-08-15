import { create } from "zustand";
import api from "@/lib/axios";
import { OPERATIONS_API as URL } from "@/utils/constants/apis/operations.api.constant";
import { extractErrorMessage } from "@/utils/functions/error";
import { ILowStockAlert, IOperationsReport, IPurchaseOrder, ISalesReturn, ISupplier } from "@/utils/interfaces/operations/operations.interface";

interface State {
  alerts: ILowStockAlert[]; suppliers: ISupplier[]; purchaseOrders: IPurchaseOrder[]; returns: ISalesReturn[];
  report: IOperationsReport | null; loading: boolean; error: string | null;
  fetchAlerts(): Promise<void>; fetchSuppliers(): Promise<void>; fetchPurchaseOrders(): Promise<void>;
  fetchReturns(): Promise<void>; fetchReport(days?: number, forecastDays?: number): Promise<void>;
  createSupplier(name: string): Promise<boolean>;
  createPurchaseOrder(payload: object): Promise<boolean>; orderPurchase(id: string): Promise<boolean>; receivePurchase(id: string, items: {item_id:string;quantity:number}[]): Promise<boolean>;
  createReturn(payload: object): Promise<boolean>; receiveReturn(id: string): Promise<boolean>; refundReturn(id: string): Promise<boolean>;
}

export const useOperationsStore = create<State>((set, get) => {
  const fail = (error: unknown) => { set({ error: extractErrorMessage(error), loading: false }); return false; };
  return {
    alerts: [], suppliers: [], purchaseOrders: [], returns: [], report: null, loading: false, error: null,
    fetchAlerts: async () => { try { const {data}=await api.get<ILowStockAlert[]>(URL.ALERTS); set({alerts:data}); } catch(error){ fail(error); } },
    fetchSuppliers: async () => { try { const {data}=await api.get<ISupplier[]>(URL.SUPPLIERS); set({suppliers:data}); } catch(error){ fail(error); } },
    fetchPurchaseOrders: async () => { try { const {data}=await api.get<IPurchaseOrder[]>(URL.PURCHASE_ORDERS); set({purchaseOrders:data}); } catch(error){ fail(error); } },
    fetchReturns: async () => { try { const {data}=await api.get<ISalesReturn[]>(URL.RETURNS); set({returns:data}); } catch(error){ fail(error); } },
    fetchReport: async (days=30, forecastDays=30) => { try { const {data}=await api.get<IOperationsReport>(URL.REPORTS,{params:{days,forecast_days:forecastDays}}); set({report:data}); } catch(error){ fail(error); } },
    createSupplier: async (name) => { set({loading:true,error:null}); try { await api.post(URL.SUPPLIERS,{name}); await get().fetchSuppliers(); set({loading:false}); return true; } catch(error){return fail(error);} },
    createPurchaseOrder: async (payload) => { set({loading:true,error:null}); try { await api.post(URL.PURCHASE_ORDERS,payload); await get().fetchPurchaseOrders(); set({loading:false}); return true; } catch(error){return fail(error);} },
    orderPurchase: async (id) => { set({loading:true,error:null}); try { await api.patch(URL.PURCHASE_ORDER(id),{status:"ordered"}); await get().fetchPurchaseOrders(); set({loading:false}); return true; } catch(error){return fail(error);} },
    receivePurchase: async (id,items) => { set({loading:true,error:null}); try { await api.post(URL.RECEIVE_PURCHASE(id),{items}); await Promise.all([get().fetchPurchaseOrders(),get().fetchAlerts()]); set({loading:false}); return true; } catch(error){return fail(error);} },
    createReturn: async (payload) => { set({loading:true,error:null}); try { await api.post(URL.RETURNS,payload); await get().fetchReturns(); set({loading:false}); return true; } catch(error){return fail(error);} },
    receiveReturn: async (id) => { set({loading:true,error:null}); try { await api.post(URL.RECEIVE_RETURN(id)); await get().fetchReturns(); set({loading:false}); return true; } catch(error){return fail(error);} },
    refundReturn: async (id) => { set({loading:true,error:null}); try { await api.post(URL.REFUND_RETURN(id)); await get().fetchReturns(); set({loading:false}); return true; } catch(error){return fail(error);} },
  };
});
