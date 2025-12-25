import fetchC from "@/libs/fetchC";
import { StaticPage } from "./admin/static-pages";

export const staticPagesApi = {
    getBySlug: async (slug: string): Promise<StaticPage> => {
        return fetchC.get(`/settings/pages/${slug}`);
    },
};
