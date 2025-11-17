import { accountDashboardContract } from "./features/account/dashboard/contract";
import { tsBuildUrl } from "./shared/utils/paths";

const res = tsBuildUrl(accountDashboardContract.accountDashboardSummary, {
  query: {},
});

console.log(res);
