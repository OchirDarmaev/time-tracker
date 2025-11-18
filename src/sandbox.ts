import { accountDashboardContract } from "@/features/account/dashboard/contract";
import { tsBuildUrl } from "@/shared/utils/paths";

const res = tsBuildUrl(accountDashboardContract.dashboard, {
  headers: {},
  query: {
    date: "2025-11-19",
  },
});

console.log(res);
