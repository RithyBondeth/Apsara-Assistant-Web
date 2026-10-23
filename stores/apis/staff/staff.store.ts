import { create } from "zustand";
import api from "@/lib/axios";
import { STAFF_API } from "@/utils/constants/apis/staff.api.constant";
import { IMember, IStaffCreate } from "@/utils/interfaces/staff/staff.interface";
import { extractErrorMessage } from "@/utils/functions/error";

interface IStaffStore {
  members: IMember[];
  loading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  /** Creates the account and emails them a link to set their password. */
  addStaff: (payload: IStaffCreate) => Promise<boolean>;
  resendInvite: (id: string) => Promise<boolean>;
  setActive: (id: string, active: boolean) => Promise<boolean>;
  clearError: () => void;
}

export const useStaffStore = create<IStaffStore>((set, get) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get<IMember[]>(STAFF_API.LIST);
      set({ members: data, loading: false });
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
    }
  },

  addStaff: async (payload) => {
    set({ loading: true, error: null });
    try {
      await api.post<IMember>(STAFF_API.CREATE, payload);
      await get().fetchMembers();
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  resendInvite: async (id) => {
    set({ error: null });
    try {
      await api.post(STAFF_API.INVITE(id));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error) });
      return false;
    }
  },

  setActive: async (id, active) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.patch<IMember>(STAFF_API.UPDATE(id), { is_active: active });
      set((s) => ({
        members: s.members.map((m) => (m.id === id ? data : m)),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: extractErrorMessage(error), loading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
