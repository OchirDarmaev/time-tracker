import { client } from "../../../lib/client";
import { buildUrl } from "../../../lib/url";
import { PageLayout } from "../../quickTimeReport/PageLayout";

export function UsersManagementPage() {
  const usersManagementUrl = buildUrl(client.partials.usersManagement);
  return (
    <PageLayout
      title="Users Management"
      description="Manage users and their access to projects"
    >
      <div
        hx-get={usersManagementUrl}
        hx-swap="outerHTML"
        hx-trigger="load"
      />
    </PageLayout>
  );
}
