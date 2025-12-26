import fetchC from "@/libs/fetchC";
import { SiteSettings } from "./admin/settings";

export const settingsApi = {
    get: async (): Promise<SiteSettings> => {
        return fetchC.get("/settings");
    },
};
