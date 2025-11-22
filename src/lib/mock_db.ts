// Mock database with promise-based access

type User = {
  id: number;
  email: string;
  roles: string; // JSON string
  active: number; // 0 or 1
};

type Project = {
  id: number;
  name: string;
  suppressed: number; // 0 or 1
  color: string;
  isSystem: number; // 0 or 1
};

type ProjectUser = {
  id: number;
  user_id: number;
  project_id: number;
  suppressed: number; // 0 or 1
};

type TimeEntry = {
  id: number;
  user_id: number;
  project_id: number;
  date: string;
  hours: number;
  comment: string | null;
};

type Calendar = {
  id: number;
  date: string;
  day_type: "workday" | "public_holiday" | "weekend";
  updated_at: string;
};

type Session = {
  session_id: string;
  data: string; // JSON string
  expires_at: number;
};

class MockDB {
  private users: User[] = [];
  private projects: Project[] = [];
  private projectUsers: ProjectUser[] = [];
  private timeEntries: TimeEntry[] = [];
  private calendar: Calendar[] = [];
  private sessions: Session[] = [];

  private userIdCounter = 1;
  private projectIdCounter = 1;
  private projectUserIdCounter = 1;
  private timeEntryIdCounter = 1;
  private calendarIdCounter = 1;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initialize users
    this.users = [
      {
        id: this.userIdCounter++,
        email: "account-1@mail.com",
        roles: '["account"]',
        active: 1,
      },
      {
        id: this.userIdCounter++,
        email: "account-2@mail.com",
        roles: '["account"]',
        active: 1,
      },
      {
        id: this.userIdCounter++,
        email: "office-manager@mail.com",
        roles: '["account","office-manager"]',
        active: 1,
      },
      {
        id: this.userIdCounter++,
        email: "admin@mail.com",
        roles: '["account", "admin"]',
        active: 1,
      },
      {
        id: this.userIdCounter++,
        email: "all-roles@mail.com",
        roles: '["account", "office-manager","admin"]',
        active: 1,
      },
    ];

    // Initialize projects
    this.projects = [
      {
        id: this.projectIdCounter++,
        name: "jupiter",
        suppressed: 0,
        color: "#14b8a6",
        isSystem: 0,
      },
      {
        id: this.projectIdCounter++,
        name: "mars",
        suppressed: 0,
        color: "#06b6d4",
        isSystem: 0,
      },
      {
        id: this.projectIdCounter++,
        name: "Paid Vacation",
        suppressed: 0,
        color: "#10b981",
        isSystem: 1,
      },
      {
        id: this.projectIdCounter++,
        name: "Unpaid Vacation",
        suppressed: 0,
        color: "#f59e0b",
        isSystem: 1,
      },
      {
        id: this.projectIdCounter++,
        name: "Holiday",
        suppressed: 0,
        color: "#ef4444",
        isSystem: 1,
      },
    ];

    // Initialize project_users
    const jupiterId = this.projects.find((p) => p.name === "jupiter")!.id;
    const marsId = this.projects.find((p) => p.name === "mars")!.id;
    const paidVacationId = this.projects.find(
      (p) => p.name === "Paid Vacation"
    )!.id;
    const unpaidVacationId = this.projects.find(
      (p) => p.name === "Unpaid Vacation"
    )!.id;
    const holidayId = this.projects.find((p) => p.name === "Holiday")!.id;

    const account1Id = this.users.find(
      (u) => u.email === "account-1@mail.com"
    )!.id;
    const account2Id = this.users.find(
      (u) => u.email === "account-2@mail.com"
    )!.id;
    const officeManagerId = this.users.find(
      (u) => u.email === "office-manager@mail.com"
    )!.id;
    const adminId = this.users.find((u) => u.email === "admin@mail.com")!.id;
    const allRolesId = this.users.find(
      (u) => u.email === "all-roles@mail.com"
    )!.id;

    // Assign jupiter and mars to account-1, account-2, office-manager, all-roles, admin
    [account1Id, account2Id, officeManagerId, allRolesId, adminId].forEach(
      (userId) => {
        this.projectUsers.push({
          id: this.projectUserIdCounter++,
          user_id: userId,
          project_id: jupiterId,
          suppressed: 0,
        });
        this.projectUsers.push({
          id: this.projectUserIdCounter++,
          user_id: userId,
          project_id: marsId,
          suppressed: 0,
        });
      }
    );

    // Assign default vacation and holiday projects to all users
    this.users.forEach((user) => {
      [paidVacationId, unpaidVacationId, holidayId].forEach((projectId) => {
        this.projectUsers.push({
          id: this.projectUserIdCounter++,
          user_id: user.id,
          project_id: projectId,
          suppressed: 0,
        });
      });
    });

    // Initialize calendar
    this.calendar = [
      {
        id: this.calendarIdCounter++,
        date: "2025-11-01",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-02",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-03",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-04",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-05",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-06",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-07",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-08",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-09",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-10",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-11",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-12",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-13",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-14",
        day_type: "public_holiday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-15",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-16",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-17",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-18",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-19",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-20",
        day_type: "public_holiday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-21",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-22",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-23",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-24",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-25",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-26",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-27",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-28",
        day_type: "workday",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-29",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
      {
        id: this.calendarIdCounter++,
        date: "2025-11-30",
        day_type: "weekend",
        updated_at: new Date().toISOString(),
      },
    ];

    // Initialize time entries for account-1@mail.com
    const timeEntriesData = [
      {
        date: "2025-11-03",
        projectName: "jupiter",
        hours: 5.0,
        comment: "Working on jupiter project features #development",
      },
      {
        date: "2025-11-03",
        projectName: "mars",
        hours: 3.0,
        comment: "Mars project code review #review",
      },
      {
        date: "2025-11-04",
        projectName: "jupiter",
        hours: 4.5,
        comment: "Jupiter project implementation",
      },
      {
        date: "2025-11-04",
        projectName: "mars",
        hours: 3.5,
        comment: "Mars project bug fixes #bugfix",
      },
      {
        date: "2025-11-05",
        projectName: "jupiter",
        hours: 8.0,
        comment: "Full day on jupiter project #development",
      },
      {
        date: "2025-11-06",
        projectName: "jupiter",
        hours: 3.0,
        comment: "Jupiter project meetings",
      },
      {
        date: "2025-11-06",
        projectName: "mars",
        hours: 5.0,
        comment: "Mars project development #development",
      },
      {
        date: "2025-11-07",
        projectName: "jupiter",
        hours: 2.5,
        comment: "Jupiter project documentation",
      },
      {
        date: "2025-11-07",
        projectName: "mars",
        hours: 5.5,
        comment: "Mars project testing and deployment #testing",
      },
      {
        date: "2025-11-10",
        projectName: "jupiter",
        hours: 6.0,
        comment: "Jupiter project new features #development",
      },
      {
        date: "2025-11-10",
        projectName: "mars",
        hours: 2.0,
        comment: "Mars project maintenance",
      },
      {
        date: "2025-11-11",
        projectName: "jupiter",
        hours: 4.0,
        comment: "Jupiter project refactoring #refactoring",
      },
      {
        date: "2025-11-11",
        projectName: "mars",
        hours: 4.0,
        comment: "Mars project feature development #development",
      },
      {
        date: "2025-11-12",
        projectName: "jupiter",
        hours: 7.5,
        comment: "Jupiter project implementation and testing",
      },
      {
        date: "2025-11-12",
        projectName: "mars",
        hours: 0.5,
        comment: "Quick mars project fix",
      },
      {
        date: "2025-11-13",
        projectName: "jupiter",
        hours: 3.5,
        comment: "Jupiter project code review #review",
      },
      {
        date: "2025-11-13",
        projectName: "mars",
        hours: 4.5,
        comment: "Mars project new module development #development",
      },
      {
        date: "2025-11-14",
        projectName: "Holiday",
        hours: 8.0,
        comment: "Public holiday work",
      },
    ];

    timeEntriesData.forEach((entry) => {
      const project = this.projects.find((p) => p.name === entry.projectName);
      if (project) {
        this.timeEntries.push({
          id: this.timeEntryIdCounter++,
          user_id: account1Id,
          project_id: project.id,
          date: entry.date,
          hours: entry.hours,
          comment: entry.comment,
        });
      }
    });
  }

  // Users methods
  async findUserById(id: number): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.id === id) || null);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.users.find((u) => u.email === email) || null);
  }

  async findAllUsers(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }

  async createUser(
    email: string,
    roles: string = '["account"]',
    active: number = 1
  ): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      email,
      roles,
      active,
    };
    this.users.push(user);
    return Promise.resolve(user);
  }

  async updateUser(
    id: number,
    updates: Partial<Omit<User, "id">>
  ): Promise<User | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return Promise.resolve(null);
    this.users[index] = { ...this.users[index], ...updates };
    return Promise.resolve(this.users[index]);
  }

  async deleteUser(id: number): Promise<boolean> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return Promise.resolve(false);
    this.users.splice(index, 1);
    // Cascade delete project_users and time_entries
    this.projectUsers = this.projectUsers.filter((pu) => pu.user_id !== id);
    this.timeEntries = this.timeEntries.filter((te) => te.user_id !== id);
    return Promise.resolve(true);
  }

  // Projects methods
  async findProjectById(id: number): Promise<Project | null> {
    return Promise.resolve(this.projects.find((p) => p.id === id) || null);
  }

  async findProjectByName(name: string): Promise<Project | null> {
    return Promise.resolve(this.projects.find((p) => p.name === name) || null);
  }

  async findAllProjects(): Promise<Project[]> {
    return Promise.resolve([...this.projects]);
  }

  async createProject(
    name: string,
    suppressed: number = 0,
    color: string = "#14b8a6",
    isSystem: number = 0
  ): Promise<Project> {
    const project: Project = {
      id: this.projectIdCounter++,
      name,
      suppressed,
      color,
      isSystem,
    };
    this.projects.push(project);
    return Promise.resolve(project);
  }

  async updateProject(
    id: number,
    updates: Partial<Omit<Project, "id">>
  ): Promise<Project | null> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(null);
    this.projects[index] = { ...this.projects[index], ...updates };
    return Promise.resolve(this.projects[index]);
  }

  async deleteProject(id: number): Promise<boolean> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return Promise.resolve(false);
    this.projects.splice(index, 1);
    // Cascade delete project_users and time_entries
    this.projectUsers = this.projectUsers.filter((pu) => pu.project_id !== id);
    this.timeEntries = this.timeEntries.filter((te) => te.project_id !== id);
    return Promise.resolve(true);
  }

  // ProjectUsers methods
  async findProjectUsersByUserId(userId: number): Promise<ProjectUser[]> {
    return Promise.resolve(
      this.projectUsers.filter(
        (pu) => pu.user_id === userId && pu.suppressed === 0
      )
    );
  }

  async findProjectUsersByProjectId(projectId: number): Promise<ProjectUser[]> {
    return Promise.resolve(
      this.projectUsers.filter(
        (pu) => pu.project_id === projectId && pu.suppressed === 0
      )
    );
  }

  async findProjectUser(
    userId: number,
    projectId: number
  ): Promise<ProjectUser | null> {
    return Promise.resolve(
      this.projectUsers.find(
        (pu) => pu.user_id === userId && pu.project_id === projectId
      ) || null
    );
  }

  async createProjectUser(
    userId: number,
    projectId: number,
    suppressed: number = 0
  ): Promise<ProjectUser> {
    const projectUser: ProjectUser = {
      id: this.projectUserIdCounter++,
      user_id: userId,
      project_id: projectId,
      suppressed,
    };
    this.projectUsers.push(projectUser);
    return Promise.resolve(projectUser);
  }

  async updateProjectUser(
    id: number,
    updates: Partial<Omit<ProjectUser, "id">>
  ): Promise<ProjectUser | null> {
    const index = this.projectUsers.findIndex((pu) => pu.id === id);
    if (index === -1) return Promise.resolve(null);
    this.projectUsers[index] = { ...this.projectUsers[index], ...updates };
    return Promise.resolve(this.projectUsers[index]);
  }

  async deleteProjectUser(id: number): Promise<boolean> {
    const index = this.projectUsers.findIndex((pu) => pu.id === id);
    if (index === -1) return Promise.resolve(false);
    this.projectUsers.splice(index, 1);
    return Promise.resolve(true);
  }

  async findAllProjectUsers(): Promise<ProjectUser[]> {
    return Promise.resolve([...this.projectUsers]);
  }

  // TimeEntries methods
  async findTimeEntryById(id: number): Promise<TimeEntry | null> {
    return Promise.resolve(this.timeEntries.find((te) => te.id === id) || null);
  }

  async findTimeEntriesByUserId(userId: number): Promise<TimeEntry[]> {
    return Promise.resolve(
      this.timeEntries.filter((te) => te.user_id === userId)
    );
  }

  async findTimeEntriesByProjectId(projectId: number): Promise<TimeEntry[]> {
    return Promise.resolve(
      this.timeEntries.filter((te) => te.project_id === projectId)
    );
  }

  async findTimeEntriesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<TimeEntry[]> {
    return Promise.resolve(
      this.timeEntries.filter(
        (te) => te.date >= startDate && te.date <= endDate
      )
    );
  }

  async findTimeEntriesByUserAndDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<TimeEntry[]> {
    return Promise.resolve(
      this.timeEntries.filter(
        (te) =>
          te.user_id === userId && te.date >= startDate && te.date <= endDate
      )
    );
  }

  async createTimeEntry(
    userId: number,
    projectId: number,
    date: string,
    hours: number,
    comment: string | null = null
  ): Promise<TimeEntry> {
    const timeEntry: TimeEntry = {
      id: this.timeEntryIdCounter++,
      user_id: userId,
      project_id: projectId,
      date,
      hours,
      comment,
    };
    this.timeEntries.push(timeEntry);
    return Promise.resolve(timeEntry);
  }

  async updateTimeEntry(
    id: number,
    updates: Partial<Omit<TimeEntry, "id">>
  ): Promise<TimeEntry | null> {
    const index = this.timeEntries.findIndex((te) => te.id === id);
    if (index === -1) return Promise.resolve(null);
    this.timeEntries[index] = { ...this.timeEntries[index], ...updates };
    return Promise.resolve(this.timeEntries[index]);
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    const index = this.timeEntries.findIndex((te) => te.id === id);
    if (index === -1) return Promise.resolve(false);
    this.timeEntries.splice(index, 1);
    return Promise.resolve(true);
  }

  async deleteTimeEntriesByUserAndDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const initialLength = this.timeEntries.length;
    this.timeEntries = this.timeEntries.filter(
      (te) =>
        !(te.user_id === userId && te.date >= startDate && te.date <= endDate)
    );
    return Promise.resolve(initialLength - this.timeEntries.length);
  }

  // Calendar methods
  async findCalendarByDate(date: string): Promise<Calendar | null> {
    return Promise.resolve(this.calendar.find((c) => c.date === date) || null);
  }

  async findCalendarByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Calendar[]> {
    return Promise.resolve(
      this.calendar.filter((c) => c.date >= startDate && c.date <= endDate)
    );
  }

  async findCalendarByDayType(
    dayType: "workday" | "public_holiday" | "weekend"
  ): Promise<Calendar[]> {
    return Promise.resolve(this.calendar.filter((c) => c.day_type === dayType));
  }

  async findAllCalendar(): Promise<Calendar[]> {
    return Promise.resolve([...this.calendar]);
  }

  async createCalendar(
    date: string,
    dayType: "workday" | "public_holiday" | "weekend",
    updatedAt?: string
  ): Promise<Calendar> {
    const calendar: Calendar = {
      id: this.calendarIdCounter++,
      date,
      day_type: dayType,
      updated_at: updatedAt || new Date().toISOString(),
    };
    this.calendar.push(calendar);
    return Promise.resolve(calendar);
  }

  async updateCalendar(
    id: number,
    updates: Partial<Omit<Calendar, "id">>
  ): Promise<Calendar | null> {
    const index = this.calendar.findIndex((c) => c.id === id);
    if (index === -1) return Promise.resolve(null);
    this.calendar[index] = { ...this.calendar[index], ...updates };
    return Promise.resolve(this.calendar[index]);
  }

  async deleteCalendar(id: number): Promise<boolean> {
    const index = this.calendar.findIndex((c) => c.id === id);
    if (index === -1) return Promise.resolve(false);
    this.calendar.splice(index, 1);
    return Promise.resolve(true);
  }

  // Sessions methods
  async findSessionById(sessionId: string): Promise<Session | null> {
    const session = this.sessions.find((s) => s.session_id === sessionId);
    if (!session) return Promise.resolve(null);
    // Check if expired
    if (session.expires_at < Date.now()) {
      this.sessions = this.sessions.filter((s) => s.session_id !== sessionId);
      return Promise.resolve(null);
    }
    return Promise.resolve(session);
  }

  async findAllSessions(): Promise<Session[]> {
    // Filter out expired sessions
    const now = Date.now();
    this.sessions = this.sessions.filter((s) => s.expires_at >= now);
    return Promise.resolve([...this.sessions]);
  }

  // Join/Query methods
  async getUserProjects(
    userId: number
  ): Promise<(Project & { suppressed: number })[]> {
    const projectUserIds = this.projectUsers
      .filter((pu) => pu.user_id === userId && pu.suppressed === 0)
      .map((pu) => pu.project_id);
    const projects = this.projects.filter((p) => projectUserIds.includes(p.id));
    return Promise.resolve(
      projects.map((p) => {
        const pu = this.projectUsers.find(
          (pu) => pu.user_id === userId && pu.project_id === p.id
        );
        return { ...p, suppressed: pu?.suppressed || 0 };
      })
    );
  }

  async getProjectUsers(
    projectId: number
  ): Promise<(User & { suppressed: number })[]> {
    const userIds = this.projectUsers
      .filter((pu) => pu.project_id === projectId && pu.suppressed === 0)
      .map((pu) => pu.user_id);
    const users = this.users.filter((u) => userIds.includes(u.id));
    return Promise.resolve(
      users.map((u) => {
        const pu = this.projectUsers.find(
          (pu) => pu.user_id === u.id && pu.project_id === projectId
        );
        return { ...u, suppressed: pu?.suppressed || 0 };
      })
    );
  }

  async getTimeEntriesWithDetails(
    userId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<
    (TimeEntry & {
      user: User;
      project: Project;
    })[]
  > {
    let entries = [...this.timeEntries];
    if (userId) {
      entries = entries.filter((te) => te.user_id === userId);
    }
    if (startDate && endDate) {
      entries = entries.filter(
        (te) => te.date >= startDate && te.date <= endDate
      );
    }
    return Promise.resolve(
      entries.map((te) => {
        const user = this.users.find((u) => u.id === te.user_id)!;
        const project = this.projects.find((p) => p.id === te.project_id)!;
        return { ...te, user, project };
      })
    );
  }
}

// Export singleton instance
export const mockDb = new MockDB();

// Export types
export type { User, Project, ProjectUser, TimeEntry, Calendar, Session };
