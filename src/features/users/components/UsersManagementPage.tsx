import { PageLayout } from "../../quickTimeReport/PageLayout";

export function UsersManagementPage() {
  return (
    <PageLayout
      title="Users Management"
      description="Manage users and their access to projects"
    >
      <div
        hx-get={`/partials/usersManagement`}
        hx-swap="outerHTML"
        hx-trigger="load"
      />
    </PageLayout>
  );
}
