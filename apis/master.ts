import fetchC from "@/libs/fetchC";
import { ICountry, IDivision, ICurrency } from "@/types/response/base.type";
import { ISupplier } from "@/types/response/tour.type";

export const masterApi = {
  getCountries: async () => {
    const url = "/country/getAll";
    const data: ICountry[] = await fetchC.get(url, { cache: "no-store" });
    return Array.isArray(data) ? data : [];
  },
  getDivisions: async () => {
    const url = "/division/getAll";
    const data: IDivision[] = await fetchC.get(url, { cache: "no-store" });
    return Array.isArray(data) ? data : [];
  },
  getCurrencies: async () => {
    const url = "/currency/getAll";
    const data: ICurrency[] = await fetchC.get(url, { cache: "no-store" });
    return Array.isArray(data) ? data : [];
  },
  getSuppliers: async () => {
    const url = "/supplier/getAll";
    const data: ISupplier[] = await fetchC.get(url, { cache: "no-store" });
    return Array.isArray(data) ? data : [];
  },
};