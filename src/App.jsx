import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API = "https://skillsync-backend-dog1.onrender.com";

/* =========================================================
   APP
========================================================= */

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("skillsyncUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPage] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  const login = (loggedUser) => {
    localStorage.setItem(
      "skillsyncUser",
      JSON.stringify(loggedUser)
    );
    setUser(loggedUser);
    setPage("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("skillsyncUser");
    setUser(null);
    setPage("dashboard");
  };

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="app">
      <Sidebar
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
      />

      <main className="main-content">

        {page === "dashboard" && (
          <Dashboard
            user={user}
            setPage={setPage}
          />
        )}

        {page === "profile" && (
          <ProfilePage user={user} />
        )}

        {page === "projects" &&
          user.role === "STUDENT" && (
            <ProjectsPage
              user={user}
              onOpenTeam={(project) => {
                setSelectedProject(project);
                setPage("team");
              }}
              onFindTeammates={(project) => {
                setSelectedProject(project);
                setPage("find-teammates");
              }}
            />
          )}

        {page === "find-teammates" &&
          user.role === "STUDENT" && (
            <FindTeammates
              user={user}
              project={selectedProject}
              onBack={() => setPage("projects")}
            />
          )}

        {page === "team" &&
          user.role === "STUDENT" && (
            <ProjectTeam
              user={user}
              project={selectedProject}
              onBack={() => setPage("projects")}
            />
          )}

        {page === "collaboration" &&
          user.role === "STUDENT" && (
            <CollaborationRequests
              user={user}
              onOpenProject={(projectId) => {
                axios
                  .get(`${API}/projects/${projectId}`)
                  .then((response) => {
                    setSelectedProject(response.data);
                    setPage("team");
                  })
                  .catch(console.error);
              }}
            />
          )}

        {page === "faculty-mentors" &&
          user.role === "STUDENT" && (
            <FacultyMentorsPage
              user={user}
              onBack={() => setPage("dashboard")}
              onOpenChat={({ faculty, project }) => {
                setSelectedProject(project);
                setSelectedChatUser(faculty);
              }}
            />
          )}

        {page === "opportunities" && (
  <OpportunitiesPage user={user} />
)}

        {page === "students" &&
          user.role === "FACULTY" && (
            <FacultyProjectsPage user={user} />
          )}

        {page === "guidance" &&
          user.role === "FACULTY" && (
            <FacultyGuidancePage user={user} />
          )}

        {page === "admin-users" &&
          user.role === "ADMIN" && (
            <SimplePage
              title="Manage Users"
              subtitle="Manage students and faculty from your university."
              icon="👥"
            />
          )}

        {page === "admin-projects" &&
          user.role === "ADMIN" && (
            <SimplePage
              title="Manage Projects"
              subtitle="View projects from your university."
              icon="📁"
            />
          )}

        {selectedChatUser && selectedProject && (
          <ProjectChat
            user={user}
            project={selectedProject}
            otherUser={selectedChatUser}
            onClose={() => setSelectedChatUser(null)}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("STUDENT");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const endpoint =
        mode === "login"
          ? `${API}/auth/login`
          : `${API}/auth/register`;

      const data =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
              role,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role,
            };

      const response = await axios.post(
        endpoint,
        data
      );

      if (response.data.success) {
        if (mode === "login") {
          onLogin(response.data);
        } else {
          setMessage(
            "Registration successful. Please login."
          );
          setMode("login");
        }
      } else {
        setMessage(
          response.data.message ||
            "Something went wrong."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">✦</div>

        <h1>SkillSync</h1>

        <p className="login-subtitle">
          Connect. Collaborate. Grow.
        </p>

        <div className="auth-tabs">
          <button
            className={
              mode === "login" ? "active" : ""
            }
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={
              mode === "register" ? "active" : ""
            }
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <div className="role-selector">
          <button
            className={
              role === "STUDENT" ? "active" : ""
            }
            onClick={() => setRole("STUDENT")}
          >
            🎓 Student
          </button>

          <button
            className={
              role === "FACULTY" ? "active" : ""
            }
            onClick={() => setRole("FACULTY")}
          >
            👩‍🏫 Faculty
          </button>

          <button
            className={
              role === "ADMIN" ? "active" : ""
            }
            onClick={() => setRole("ADMIN")}
          >
            🛡️ Admin
          </button>
        </div>

        <form onSubmit={submit}>

          {mode === "register" && (
            <input
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={update}
              required
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="University email"
            value={form.email}
            onChange={update}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update}
            required
          />

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            className="primary-button full-width"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  user,
  page,
  setPage,
  logout,
}) {
  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-icon">✦</div>

        <div>
          <h2>SkillSync</h2>
          <span>
            {user.role === "STUDENT"
              ? "Student Portal"
              : user.role === "FACULTY"
              ? "Faculty Portal"
              : "University Admin"}
          </span>
        </div>
      </div>

      <div className="user-box">

        <div className="avatar">
          {user.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div>
          <strong>{user.name}</strong>
          <small>{user.role}</small>
        </div>
      </div>

      <nav>

        <button
          className={
            page === "dashboard"
              ? "nav-active"
              : ""
          }
          onClick={() => setPage("dashboard")}
        >
          🏠 Dashboard
        </button>

        <button
          className={
            page === "profile"
              ? "nav-active"
              : ""
          }
          onClick={() => setPage("profile")}
        >
          👤 My Profile
        </button>

        {user.role === "STUDENT" && (
          <>
            <button
              className={
                page === "projects"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setPage("projects")
              }
            >
              📁 My Projects
            </button>

            <button
              className={
                page === "find-teammates"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setPage("find-teammates")
              }
            >
              👥 Find Teammates
            </button>

            <button
              className={
                page === "collaboration"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setPage("collaboration")
              }
            >
              🤝 Collaboration
            </button>

            <button
              className={
                page === "faculty-mentors"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setPage("faculty-mentors")
              }
            >
              👩‍🏫 Faculty Mentors
            </button>
          </>
        )}

        {user.role === "FACULTY" && (
          <>
            <button
              className={
                page === "students"
                  ? "nav-active"
                  : ""
              }
              onClick={() => setPage("students")}
            >
              📁 Student Projects
            </button>

            <button
              className={
                page === "guidance"
                  ? "nav-active"
                  : ""
              }
              onClick={() => setPage("guidance")}
            >
              💬 Student Guidance
            </button>
          </>
        )}

        {user.role !== "ADMIN" && (
          <button
            className={
              page === "opportunities"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("opportunities")
            }
          >
            🎯 Opportunities
          </button>
        )}

        {user.role === "ADMIN" && (
          <>
            <button
              className={
                page === "admin-users"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setPage("admin-users")
              }
            >
              👥 Manage Users
            </button>

            <button
              className={
                page === "admin-projects"
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setPage("admin-projects")
              }
            >
              📁 Manage Projects
            </button>
          </>
        )}
      </nav>

      <button
        className="logout-button"
        onClick={logout}
      >
        ↪ Logout
      </button>
    </aside>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({ user, setPage }) {

  if (user.role === "FACULTY") {
    return (
      <FacultyDashboard
        user={user}
        setPage={setPage}
      />
    );
  }

  if (user.role === "ADMIN") {
    return (
      <AdminDashboard
        user={user}
        setPage={setPage}
      />
    );
  }

  return (
    <div className="page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            STUDENT DASHBOARD
          </p>

          <h1>
            Hello, {user.name} 👋
          </h1>

          <p>
            Build your profile and start
            collaborating.
          </p>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <span>✨</span>
          <h3>Skills</h3>
          <strong>—</strong>
          <p>Skills added</p>
        </div>

        <div className="stat-card">
          <span>📁</span>
          <h3>Projects</h3>
          <strong>—</strong>
          <p>Projects created</p>
        </div>

        <div className="stat-card">
          <span>🤝</span>
          <h3>Connections</h3>
          <strong>—</strong>
          <p>Collaborations</p>
        </div>

        <div className="stat-card">
          <span>🎯</span>
          <h3>Opportunities</h3>
          <strong>—</strong>
          <p>Recommended</p>
        </div>
      </div>

      <div className="welcome-card">
        <div>
          <p className="eyebrow">
            STUDENT SPACE
          </p>

          <h2>
            Your skills can build something
            amazing.
          </h2>

          <p>
            Create a project, explore student
            profiles, find teammates and
            collaborate.
          </p>

          <button
            className="primary-button"
            onClick={() => setPage("projects")}
          >
            View My Projects →
          </button>
        </div>

        <div className="welcome-icon">
          🌸
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FACULTY DASHBOARD
========================================================= */

function FacultyDashboard({
  user,
  setPage,
}) {
  return (
    <div className="page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            FACULTY DASHBOARD
          </p>

          <h1>
            Welcome, {user.name} 👋
          </h1>

          <p>
            Monitor student projects and
            support your university community.
          </p>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <span>📁</span>
          <h3>Student Projects</h3>
          <strong>—</strong>
          <p>From your university</p>
        </div>

        <div className="stat-card">
          <span>👨‍🎓</span>
          <h3>Students</h3>
          <strong>—</strong>
          <p>Registered students</p>
        </div>

        <div className="stat-card">
          <span>🚀</span>
          <h3>Active Projects</h3>
          <strong>—</strong>
          <p>Currently in progress</p>
        </div>

        <div className="stat-card">
          <span>💡</span>
          <h3>Opportunities</h3>
          <strong>—</strong>
          <p>Faculty activities</p>
        </div>
      </div>

      <div className="welcome-card">

        <div>
          <p className="eyebrow">
            FACULTY SPACE
          </p>

          <h2>
            Help students turn ideas
            into projects.
          </h2>

          <p>
            View student projects from
            your university and identify
            projects that may need guidance.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              className="primary-button"
              onClick={() => setPage("students")}
            >
              View Student Projects →
            </button>

            <button
              className="secondary-button"
              onClick={() => setPage("guidance")}
            >
              💬 Student Guidance
            </button>
          </div>
        </div>

        <div className="welcome-icon">
          👩‍🏫
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({
  user,
  setPage,
}) {
  return (
    <div className="page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            UNIVERSITY ADMIN
          </p>

          <h1>
            Welcome, {user.name} 🛡️
          </h1>

          <p>
            Manage your university's
            SkillSync community.
          </p>
        </div>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <span>👨‍🎓</span>
          <h3>Students</h3>
          <strong>—</strong>
          <p>University students</p>
        </div>

        <div className="stat-card">
          <span>👩‍🏫</span>
          <h3>Faculty</h3>
          <strong>—</strong>
          <p>University faculty</p>
        </div>

        <div className="stat-card">
          <span>📁</span>
          <h3>Projects</h3>
          <strong>—</strong>
          <p>University projects</p>
        </div>

        <div className="stat-card">
          <span>🎯</span>
          <h3>Opportunities</h3>
          <strong>—</strong>
          <p>Published opportunities</p>
        </div>
      </div>

      <div className="welcome-card">

        <div>
          <p className="eyebrow">
            ADMIN CONTROL
          </p>

          <h2>
            Manage your university
            community.
          </h2>

          <p>
            Administrators can manage
            university users and projects.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              setPage("admin-users")
            }
          >
            Manage Users →
          </button>
        </div>

        <div className="welcome-icon">
          🛡️
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE PAGE
========================================================= */

function ProfilePage({ user }) {

  const [profile, setProfile] =
    useState({});

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    const load = async () => {

      try {

        const endpoint =
          user.role === "STUDENT"
            ? `${API}/profile/student/${user.id}`
            : `${API}/profile/faculty/${user.id}`;

        const response =
          await axios.get(endpoint);

        if (response.data) {
          setProfile(response.data);
        }

      } catch (error) {
        console.error(error);
      }
    };

    load();

  }, [user]);

  const update = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const save = async (e) => {

    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {

      const endpoint =
        user.role === "STUDENT"
          ? `${API}/profile/student/${user.id}`
          : `${API}/profile/faculty/${user.id}`;

      await axios.post(
        endpoint,
        profile
      );

      setMessage(
        "Profile saved successfully."
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to save profile."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            PROFILE
          </p>

          <h1>My Profile</h1>

          <p>
            Your profile helps SkillSync
            find better teammates for you.
          </p>
        </div>
      </div>

      <form
        className="profile-card"
        onSubmit={save}
      >

        <div className="profile-avatar">
          {user.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <h2>{user.name}</h2>

        <p className="profile-email">
          {user.email}
        </p>

        {user.role === "STUDENT" ? (
          <>
            <input
              name="department"
              placeholder="Department"
              value={profile.department || ""}
              onChange={update}
            />

            <input
              name="year"
              type="number"
              placeholder="Year"
              value={profile.year || ""}
              onChange={update}
            />

            <textarea
              name="skills"
              placeholder="Skills — Python, Java, React..."
              value={profile.skills || ""}
              onChange={update}
            />

            <textarea
              name="interests"
              placeholder="Interests"
              value={profile.interests || ""}
              onChange={update}
            />

            <textarea
              name="bio"
              placeholder="About you"
              value={profile.bio || ""}
              onChange={update}
            />

            <textarea
              name="achievements"
              placeholder="Achievements"
              value={profile.achievements || ""}
              onChange={update}
            />

            <textarea
              name="certifications"
              placeholder="Certifications"
              value={profile.certifications || ""}
              onChange={update}
            />
          </>
        ) : (
          <>
            <input
              name="department"
              placeholder="Department"
              value={profile.department || ""}
              onChange={update}
            />

            <input
              name="designation"
              placeholder="Designation"
              value={profile.designation || ""}
              onChange={update}
            />

            <textarea
              name="expertise"
              placeholder="Area of expertise"
              value={profile.expertise || ""}
              onChange={update}
            />

            <textarea
              name="bio"
              placeholder="About you"
              value={profile.bio || ""}
              onChange={update}
            />
          </>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Save Profile"}
        </button>

      </form>
    </div>
  );
}

/* =========================================================
   PROJECTS
========================================================= */

function ProjectsPage({
  user,
  onOpenTeam,
  onFindTeammates,
}) {

  const [projects, setProjects] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const emptyForm = {
    title: "",
    description: "",
    requiredSkills: "",
    teamSize: 2,
    status: "PLANNING",
  };

  const [form, setForm] =
    useState(emptyForm);

  const loadProjects = async () => {

    try {

      const response =
        await axios.get(
          `${API}/projects/student/${user.id}`
        );

      setProjects(
        response.data || []
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to load projects."
      );
    }
  };

  useEffect(() => {
    loadProjects();
  }, [user.id]);

  const openCreate = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  };

  const openEdit = (project) => {

    setEditingProject(project);

    setForm({
      title: project.title || "",
      description:
        project.description || "",
      requiredSkills:
        project.requiredSkills || "",
      teamSize:
        project.teamSize || 2,
      status:
        project.status || "PLANNING",
    });

    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setForm(emptyForm);
  };

  const updateForm = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "teamSize"
          ? Number(value)
          : value,
    });
  };

  const saveProject = async (e) => {

    e.preventDefault();

    if (!form.title.trim()) {
      setMessage(
        "Please enter a project title."
      );
      return;
    }

    try {

      const payload = {
        userId: user.id,
        title: form.title,
        description: form.description,
        requiredSkills:
          form.requiredSkills,
        teamSize: form.teamSize,
        status: form.status,
      };

      if (editingProject) {

        await axios.put(
          `${API}/projects/${editingProject.id}`,
          payload
        );

        setMessage(
          "Project updated successfully."
        );

      } else {

        await axios.post(
          `${API}/projects`,
          payload
        );

        setMessage(
          "Project created successfully."
        );
      }

      await loadProjects();

      setTimeout(closeForm, 500);

    } catch (error) {

      console.error(error);

      setMessage(
        error.response?.data ||
          "Unable to save project."
      );
    }
  };

  const deleteProject = async (id) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this project?"
      )
    ) {
      return;
    }

    try {

      await axios.delete(
        `${API}/projects/${id}`
      );

      await loadProjects();

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to delete project."
      );
    }
  };

  return (
    <div className="projects-page">

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            PROJECTS
          </p>

          <h1>My Projects</h1>

          <p>
            Build your project and find
            students who complement your skills.
          </p>
        </div>

        {!showForm && (
          <button
            className="primary-button"
            onClick={openCreate}
          >
            + Create Project
          </button>
        )}
      </div>

      {message && (
        <div className="project-message success-message">
          {message}
        </div>
      )}

      {showForm && (
        <div className="project-form-card">

          <div className="project-form-header">

            <div>
              <p className="eyebrow">
                {editingProject
                  ? "EDIT PROJECT"
                  : "NEW PROJECT"}
              </p>

              <h2>
                {editingProject
                  ? "Update your project"
                  : "Create a new project"}
              </h2>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={saveProject}>

            <div className="project-form-grid">

              <div className="form-field">
                <label>Project Title</label>

                <input
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="e.g. AI Campus Assistant"
                  required
                />
              </div>

              <div className="form-field">
                <label>Required Skills</label>

                <input
                  name="requiredSkills"
                  value={form.requiredSkills}
                  onChange={updateForm}
                  placeholder="Python, React, ML"
                />
              </div>

              <div className="form-field">
                <label>Team Size</label>

                <input
                  name="teamSize"
                  type="number"
                  min="1"
                  max="20"
                  value={form.teamSize}
                  onChange={updateForm}
                />
              </div>

              <div className="form-field form-field-wide">
                <label>Description</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="Describe your project..."
                  rows="5"
                />
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={updateForm}
                >
                  <option value="PLANNING">
                    Planning
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>
                </select>
              </div>

            </div>

            <div className="project-form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingProject
                  ? "Update Project"
                  : "Create Project"}
              </button>

            </div>
          </form>
        </div>
      )}

      {!showForm &&
        projects.length === 0 && (
          <div className="empty-projects">

            <div className="empty-project-icon">
              📁
            </div>

            <h2>No projects yet</h2>

            <p>
              Create your first project and
              start building your team.
            </p>

            <button
              className="primary-button"
              onClick={openCreate}
            >
              + Create Your First Project
            </button>

          </div>
        )}

      {!showForm &&
        projects.length > 0 && (
          <div className="projects-grid">

            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() =>
                  openEdit(project)
                }
                onDelete={() =>
                  deleteProject(project.id)
                }
                onOpenTeam={() =>
                  onOpenTeam(project)
                }
                onFindTeammates={() =>
                  onFindTeammates(project)
                }
              />
            ))}

          </div>
        )}
    </div>
  );
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onOpenTeam,
  onFindTeammates,
}) {

  return (
    <div className="project-card">

      <div className="project-card-top">

        <div className="project-icon">
          📁
        </div>

        <span
          className={`project-status ${String(
            project.status || "PLANNING"
          ).toLowerCase()}`}
        >
          {String(
            project.status || "PLANNING"
          ).replace("_", " ")}
        </span>
      </div>

      <h2>{project.title}</h2>

      <p className="project-description">
        {project.description ||
          "No project description added yet."}
      </p>

      <div className="project-detail">
        <span>Required Skills</span>

        <p>
          {project.requiredSkills ||
            "Not specified"}
        </p>
      </div>

      <div className="project-detail">
        <span>Team Size</span>

        <p>
          {project.teamSize || "Not specified"}
        </p>
      </div>

      <div className="project-card-actions">

        <button
          className="edit-project-button"
          onClick={onEdit}
        >
          Edit
        </button>

        <button
          className="delete-project-button"
          onClick={onDelete}
        >
          Delete
        </button>

        <button
          className="team-project-button"
          onClick={onOpenTeam}
        >
          Open Workspace →
        </button>

      </div>

      <button
        className="find-team-large-button"
        onClick={onFindTeammates}
      >
        👥 Find Teammates
      </button>

    </div>
  );
}

/* =========================================================
   FIND TEAMMATES
========================================================= */

function FindTeammates({
  user,
  project,
  onBack,
}) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sentIds, setSentIds] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setMessage("");

      try {
        let students = [];

        // Always use the university student directory here.
        // This avoids the older project-specific candidates endpoint
        // that can return 400 from the Find Teammates page.
        const response = await axios.get(`${API}/students`);

        if (!Array.isArray(response.data)) {
          throw new Error(
            "The student directory did not return a list."
          );
        }

        students = response.data.map((student) => {
          const required = String(project?.requiredSkills || "")
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);

          const skills = String(
            student.skills ?? student.skillSet ?? ""
          );

          const skillList = skills
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);

          const matched = required.filter((skill) =>
            skillList.some(
              (studentSkill) =>
                studentSkill.includes(skill) ||
                skill.includes(studentSkill)
            )
          );

          const matchScore =
            required.length > 0
              ? Math.round((matched.length / required.length) * 100)
              : null;

          return {
            ...student,
            id: student.id ?? student.userId,
            skills,
            interests: student.interests ?? "",
            matchScore,
          };
        });

        students.sort((a, b) =>
          (b.matchScore ?? -1) - (a.matchScore ?? -1)
        );

        const currentUserId = Number(user?.id ?? user?.userId);
        students = students.filter((student) => {
          const id = Number(student.id ?? student.userId);
          return Number.isFinite(id) && id !== currentUserId;
        });

        if (!cancelled) setCandidates(students);
      } catch (error) {
        console.error("Failed to load student directory:", error);
        if (!cancelled) {
          setCandidates([]);
          setMessage(
            error.response?.data?.message ||
              (typeof error.response?.data === "string"
                ? error.response.data
                : error.message) ||
              "Unable to load students. Check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [project?.id, user?.id, user?.userId]);

  const departments = [
    ...new Set(candidates.map((student) => student.department).filter(Boolean)),
  ];

  const filteredCandidates = candidates.filter((student) => {
    const query = search.trim().toLowerCase();
    const searchableText = [
      student.name,
      student.email,
      student.department,
      student.skills,
      student.interests,
      student.bio,
      ...(Array.isArray(student.projects)
        ? student.projects.map((item) => `${item.title || ""} ${item.description || ""}`)
        : []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchableText.includes(query)) &&
      (department === "ALL" || student.department === department)
    );
  });

  const sendRequest = async (student) => {
    if (!project?.id) {
      setMessage(
        "To send a collaboration request, open My Projects and choose Find Teammates for the project you want help with."
      );
      return;
    }

    const studentId = Number(student.id ?? student.userId);
    if (!Number.isFinite(studentId)) {
      setMessage("Could not identify this student's account. Please refresh and try again.");
      return;
    }

    try {
      const response = await axios.post(
        `${API}/collaboration/request`,
        {
          projectId: project.id,
          senderId: user.id ?? user.userId,
          receiverId: studentId,
        }
      );

      const responseText = typeof response.data === "string"
        ? response.data
        : response.data?.message || "";

      if (response.status >= 200 && response.status < 300) {
        setSentIds((previous) =>
          previous.includes(studentId) ? previous : [...previous, studentId]
        );
        setMessage(responseText || "Collaboration request sent.");
      }
    } catch (error) {
      console.error("Failed to send collaboration request:", error);
      setMessage(
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message || "Unable to send request. Please try again."
      );
    }
  };

  return (
    <div className="teammates-page">
      <div className="page-heading">
        <div>
          <button className="back-button" onClick={onBack}>
            ← {project ? "My Projects" : "Dashboard"}
          </button>
          <p className="eyebrow">{project ? "TEAM BUILDER" : "STUDENT DIRECTORY"}</p>
          <h1>Find Teammates</h1>
          <p>
            {project
              ? <>Students from your university matched to: <strong>{project.title}</strong></>
              : "Explore student profiles, skills, interests, and projects without selecting a project first."}
          </p>
        </div>
      </div>

      {project ? (
        <div className="matching-project-card">
          <div>
            <span>PROJECT</span>
            <h2>{project.title}</h2>
          </div>
          <div>
            <span>LOOKING FOR</span>
            <p>{project.requiredSkills || "Any skills"}</p>
          </div>
        </div>
      ) : (
        <div className="matching-project-card">
          <div>
            <span>EXPLORE</span>
            <h2>Students at your university</h2>
            <p>Choose a project later when you're ready to invite someone.</p>
          </div>
        </div>
      )}

      <div className="candidate-filters">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, skills, interests, or project..."
          aria-label="Search students"
        />
        <select
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          aria-label="Filter by department"
        >
          <option value="ALL">All departments</option>
          {departments.map((item) => (
            <option value={item} key={item}>{item}</option>
          ))}
        </select>
      </div>

      {message && <div className="auth-message">{message}</div>}

      {loading ? (
        <div className="empty-projects">
          <div className="empty-project-icon">🔎</div>
          <h2>Loading student profiles...</h2>
          <p>Please wait while SkillSync loads the directory.</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="empty-projects">
          <div className="empty-project-icon">🌱</div>
          <h2>{candidates.length ? "No matching students" : "No students found"}</h2>
          <p>
            {candidates.length
              ? "Try another search term or department."
              : "The student directory is empty or the backend has no student profiles to return."}
          </p>
        </div>
      ) : (
        <div className="candidate-grid">
          {filteredCandidates.map((student) => {
            const id = Number(student.id ?? student.userId);
            const hasMatchScore = student.matchScore !== null && student.matchScore !== undefined;
            return (
              <div className="candidate-card" key={id}>
                <div className="candidate-top">
                  <div className="candidate-avatar">
                    {student.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <h2>{student.name || "Student"}</h2>
                    <p>
                      {student.department || "Department not added"}
                      {student.year ? ` • Year ${student.year}` : ""}
                    </p>
                  </div>
                </div>

                {hasMatchScore && (
                  <div className="match-score">
                    <span>🎯</span>
                    <strong>{student.matchScore}%</strong>
                    <small>skill match</small>
                  </div>
                )}

                <div className="candidate-section">
                  <label>Skills</label>
                  <p>{student.skills || "No skills added yet."}</p>
                </div>
                <div className="candidate-section">
                  <label>Interests</label>
                  <p>{student.interests || "No interests added yet."}</p>
                </div>

                {Array.isArray(student.projects) && student.projects.length > 0 && (
                  <div className="candidate-section">
                    <label>Projects</label>
                    {student.projects.map((item, index) => (
                      <p key={item.id ?? index}>
                        <strong>{item.title || "Untitled project"}</strong>
                        {item.description ? ` — ${item.description}` : ""}
                      </p>
                    ))}
                  </div>
                )}

                <div className="candidate-actions">
                  <button className="secondary-button" onClick={() => setSelectedStudent(student)}>
                    View Profile
                  </button>
                  <button
                    className="primary-button"
                    disabled={!project || sentIds.includes(id)}
                    title={!project ? "Select a project first to send an invitation" : "Send collaboration request"}
                    onClick={() => sendRequest(student)}
                  >
                    {!project ? "Select a Project" : sentIds.includes(id) ? "✓ Request Sent" : "Send Request"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          sent={sentIds.includes(Number(selectedStudent.id ?? selectedStudent.userId))}
          onSend={() => sendRequest(selectedStudent)}
        />
      )}
    </div>
  );
}

/* =========================================================
   CANDIDATE CARD
========================================================= */

function CandidateCard({
  student,
  sent,
  onView,
  onSend,
}) {

  return (
    <div className="candidate-card">

      <div className="candidate-top">

        <div className="candidate-avatar">
          {student.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div>
          <h2>{student.name}</h2>

          <p>
            {student.department ||
              "Department not added"}

            {student.year
              ? ` • Year ${student.year}`
              : ""}
          </p>
        </div>

      </div>

      <div className="match-score">
        <span>🎯</span>

        <strong>
          {student.matchScore}%
        </strong>

        <small>skill match</small>
      </div>

      <div className="candidate-section">

        <label>Skills</label>

        <p>
          {student.skills ||
            "No skills added yet."}
        </p>

      </div>

      <div className="candidate-section">

        <label>Interests</label>

        <p>
          {student.interests ||
            "No interests added yet."}
        </p>

      </div>

      <div className="candidate-actions">

        <button
          className="secondary-button"
          onClick={onView}
        >
          View Profile
        </button>

        <button
          className="primary-button"
          onClick={onSend}
          disabled={sent}
        >
          {sent
            ? "✓ Request Sent"
            : "Send Request"}
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   STUDENT PROFILE MODAL
========================================================= */

function StudentProfileModal({
  student,
  onClose,
  sent,
  onSend,
}) {

  return (
    <div
      className="profile-modal-overlay"
      onClick={onClose}
    >

      <div
        className="student-profile-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="large-student-avatar">
          {student.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <h1>{student.name}</h1>

        <p className="profile-modal-subtitle">
          {student.department ||
            "Department not specified"}

          {student.year
            ? ` • Year ${student.year}`
            : ""}
        </p>

        <div className="profile-match-box">
          🎯
          <strong>
            {student.matchScore}% Match
          </strong>

          <span>
            Based on project requirements
            and student profile
          </span>
        </div>

        <div className="profile-modal-grid">

          <ProfileInfo
            title="Skills"
            value={student.skills}
            icon="💻"
          />

          <ProfileInfo
            title="Interests"
            value={student.interests}
            icon="✨"
          />

          <ProfileInfo
            title="About"
            value={student.bio}
            icon="🌸"
          />

          <ProfileInfo
            title="Achievements"
            value={student.achievements}
            icon="🏆"
          />

          <ProfileInfo
            title="Certifications"
            value={student.certifications}
            icon="📜"
          />

        </div>

        <div className="profile-modal-actions">

          <button
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            className="primary-button"
            disabled={sent}
            onClick={onSend}
          >
            {sent
              ? "✓ Request Sent"
              : "🤝 Send Collaboration Request"}
          </button>

        </div>

      </div>
    </div>
  );
}

function ProfileInfo({
  title,
  value,
  icon,
}) {

  return (
    <div className="profile-info-box">

      <div>
        {icon}
        <strong>{title}</strong>
      </div>

      <p>
        {value ||
          "Not added yet."}
      </p>

    </div>
  );
}

/* =========================================================
   PROJECT WORKSPACE
========================================================= */

function ProjectTeam({
  user,
  project,
  onBack,
}) {
  const [members, setMembers] = useState([]);
  const [chatStudent, setChatStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project?.id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await axios.get(
          `${API}/collaboration/members/${project.id}`
        );

        setMembers(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error("Unable to load project members:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [project?.id]);

  if (!project) {
    return (
      <div className="page">
        <h1>No project selected.</h1>
        <button
          className="primary-button"
          onClick={onBack}
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  const people = [
    ...(project.createdBy?.id === user.id ||
    project.createdBy?.id == null
      ? []
      : [project.createdBy]),
    ...members.filter(
      (member) =>
        Number(member.id) !== Number(user.id)
    ),
  ];

  return (
    <div className="workspace-page">
      <div className="page-heading">
        <div>
          <button
            className="back-button"
            onClick={onBack}
          >
            ← My Projects
          </button>

          <p className="eyebrow">
            PROJECT WORKSPACE
          </p>

          <h1>{project.title}</h1>

          <p>
            Your project collaboration space.
            Select a teammate to start chatting.
          </p>
        </div>
      </div>

      <div className="workspace-card">
        <div className="workspace-header">
          <div>
            <span className="workspace-label">
              TEAM CHAT
            </span>

            <h2>
              Collaborate with your team
            </h2>

            <p>
              Messages are shared only with
              members of this project.
            </p>
          </div>

          <div className="workspace-icon">
            💬
          </div>
        </div>

        {loading ? (
          <div className="workspace-empty">
            Loading your project team...
          </div>
        ) : people.length === 0 ? (
          <div className="workspace-empty">
            <div className="empty-project-icon">
              👥
            </div>

            <h3>
              No teammates yet
            </h3>

            <p>
              Go to Find Teammates and invite
              students to this project.
            </p>
          </div>
        ) : (
          <div className="workspace-people">
            {people.map((member, index) => (
              <div
                className="workspace-person"
                key={
                  member.id ??
                  member.userId ??
                  index
                }
              >
                <div className="candidate-avatar">
                  {member.name
                    ?.charAt(0)
                    ?.toUpperCase() || "S"}
                </div>

                <div className="workspace-person-info">
                  <strong>
                    {member.name || "Team member"}
                  </strong>

                  <small>
                    {member.role === "FACULTY"
                      ? "Faculty Mentor"
                      : "Project Member"}
                  </small>
                </div>

                <button
                  className="primary-button"
                  onClick={() =>
                    setChatStudent(member)
                  }
                >
                  💬 Open Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {chatStudent && (
        <ProjectChat
          user={user}
          project={project}
          otherUser={chatStudent}
          onClose={() =>
            setChatStudent(null)
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   CHAT
========================================================= */

function ProjectChat({
  user,
  project,
  otherUser,
  onClose,
}) {

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const loadMessages = async () => {

    try {

      const response =
        await axios.get(
          `${API}/collaboration/chat/${project.id}/${user.id}/${otherUser.id}`
        );

      if (Array.isArray(response.data)) {
        setMessages(response.data);
      }

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    loadMessages();

    const interval =
      setInterval(
        loadMessages,
        3000
      );

    return () =>
      clearInterval(interval);

  }, [
    project.id,
    user.id,
    otherUser.id,
  ]);

  const send = async (e) => {

    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {

      await axios.post(
        `${API}/collaboration/chat`,
        {
          projectId: project.id,
          senderId: user.id,
          receiverId: otherUser.id,
          message,
        }
      );

      setMessage("");

      await loadMessages();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data ||
          "Unable to send message."
      );
    }
  };

  return (
    <div className="chat-overlay">

      <div className="chat-window">

        <div className="chat-header">

          <div className="chat-person">

            <div className="candidate-avatar">
              {otherUser.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <strong>
                {otherUser.name}
              </strong>

              <small>
                {project.title}
              </small>
            </div>

          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        <div className="chat-messages">

          {loading ? (

            <div className="chat-empty">
              Loading messages...
            </div>

          ) : messages.length === 0 ? (

            <div className="chat-empty">
              <div>💬</div>

              <strong>
                Start the conversation
              </strong>

              <p>
                Discuss your project,
                responsibilities and ideas.
              </p>
            </div>

          ) : (

            messages.map((msg) => {

              const mine =
                Number(msg.senderId) === Number(user.id);

              return (
                <div
                  key={msg.id}
                  className={
                    mine
                      ? "message-row mine"
                      : "message-row"
                  }
                >

                  <div className="message-bubble">

                    {!mine && (
                      <small>
                        {msg.senderName}
                      </small>
                    )}

                    <p>
                      {msg.message}
                    </p>

                    <span>
                      {new Date(
                        msg.sentAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>

                  </div>

                </div>
              );
            })
          )}

        </div>

        <form
          className="chat-input-area"
          onSubmit={send}
        >

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="Write a message..."
          />

          <button
            className="primary-button"
            type="submit"
          >
            Send
          </button>

        </form>

      </div>
    </div>
  );
}

/* =========================================================
   COLLABORATION REQUESTS
========================================================= */

function CollaborationRequests({
  user,
  onOpenProject,
}) {

  const [received, setReceived] =
    useState([]);

  const [sent, setSent] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const load = async () => {

    try {

      const [receivedResponse, sentResponse] =
        await Promise.all([
          axios.get(
            `${API}/collaboration/received/${user.id}`
          ),

          axios.get(
            `${API}/collaboration/sent/${user.id}`
          ),
        ]);

      setReceived(
        Array.isArray(receivedResponse.data)
          ? receivedResponse.data
          : []
      );

      setSent(
        Array.isArray(sentResponse.data)
          ? sentResponse.data
          : []
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    load();
  }, [user.id]);

  const respond = async (
    id,
    action
  ) => {

    try {

      await axios.put(
        `${API}/collaboration/request/${id}/${action}`
      );

      await load();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data ||
          "Unable to update request."
      );
    }
  };

  return (
    <div className="page">

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            COLLABORATION
          </p>

          <h1>
            Collaboration Requests
          </h1>

          <p>
            Connect with students and build
            your project team.
          </p>
        </div>

      </div>

      {loading ? (

        <div className="empty-projects">
          Loading requests...
        </div>

      ) : (

        <>
          <div className="request-section">

            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  INCOMING
                </p>

                <h2>
                  Received Requests
                </h2>
              </div>

              <span className="request-count">
                {received.length}
              </span>
            </div>

            {received.length === 0 ? (

              <div className="request-empty">
                No collaboration requests yet.
              </div>

            ) : (

              <div className="request-list">

                {received.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    received
                    onAccept={() =>
                      respond(
                        request.id,
                        "accept"
                      )
                    }
                    onReject={() =>
                      respond(
                        request.id,
                        "reject"
                      )
                    }
                    onOpenProject={() =>
                      onOpenProject(
                        request.projectId
                      )
                    }
                  />
                ))}

              </div>
            )}

          </div>

          <div className="request-section">

            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  OUTGOING
                </p>

                <h2>
                  Sent Requests
                </h2>
              </div>

              <span className="request-count">
                {sent.length}
              </span>
            </div>

            {sent.length === 0 ? (

              <div className="request-empty">
                You haven't sent any requests yet.
              </div>

            ) : (

              <div className="request-list">

                {sent.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onOpenProject={() =>
                      onOpenProject(
                        request.projectId
                      )
                    }
                  />
                ))}

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

/* =========================================================
   REQUEST CARD
========================================================= */

function RequestCard({
  request,
  received,
  onAccept,
  onReject,
  onOpenProject,
}) {

  const personName =
    received
      ? request.senderName
      : request.receiverName;

  return (
    <div className="request-card">

      <div className="candidate-avatar">
        {personName
          ?.charAt(0)
          ?.toUpperCase()}
      </div>

      <div className="request-content">

        <h3>
          {personName}
        </h3>

        <p>
          {received
            ? "wants to collaborate with you on"
            : "You requested to collaborate on"}
        </p>

        <strong>
          {request.projectTitle}
        </strong>

      </div>

      <span
        className={`request-status ${String(
          request.status
        ).toLowerCase()}`}
      >
        {request.status}
      </span>

      <div className="request-actions">

        <button
          className="secondary-button"
          onClick={onOpenProject}
        >
          View Project
        </button>

        {received &&
          request.status === "PENDING" && (
            <>
              <button
                className="primary-button"
                onClick={onAccept}
              >
                Accept
              </button>

              <button
                className="delete-project-button"
                onClick={onReject}
              >
                Reject
              </button>
            </>
          )}

      </div>

    </div>
  );
}

/* =========================================================
   FACULTY MENTORS
========================================================= */

function FacultyMentorsPage({
  user,
  onBack,
  onOpenChat,
}) {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedFaculty, setSelectedFaculty] =
    useState(null);
  const [projects, setProjects] = useState([]);
  const [facultyForChat, setFacultyForChat] =
    useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage("");

      const endpoints = [
        `${API}/users/faculty`,
        `${API}/faculty`,
        `${API}/users?role=FACULTY`,
      ];

      let loaded = false;

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint);

          if (Array.isArray(response.data)) {
            const result = response.data
              .filter(
                (item) =>
                  String(item.role || "FACULTY")
                    .toUpperCase() === "FACULTY"
              )
              .filter(
                (item) =>
                  Number(item.id ?? item.userId) !==
                  Number(user.id)
              )
              .map((item) => ({
                ...item,
                id: item.id ?? item.userId,
              }));

            if (result.length > 0) {
              setFaculty(result);
              loaded = true;
              break;
            }
          }
        } catch (error) {
          console.warn(
            `Faculty endpoint failed: ${endpoint}`,
            error
          );
        }
      }

      if (!loaded) {
        setFaculty([]);
        setMessage(
          "Unable to load faculty mentors. Your backend needs a faculty directory endpoint such as /api/users/faculty."
        );
      }

      setLoading(false);
    };

    load();
  }, [user.id]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await axios.get(
          `${API}/projects/student/${user.id}`
        );

        setProjects(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Unable to load projects for faculty chat:",
          error
        );
        setProjects([]);
      }
    };

    loadProjects();
  }, [user.id]);

  const openGuidance = (member) => {
    if (!projects.length) {
      setMessage(
        "Create a project first before requesting faculty guidance."
      );
      return;
    }

    setFacultyForChat(member);
  };

  if (facultyForChat) {
    return (
      <FacultyProjectSelector
        faculty={facultyForChat}
        projects={projects}
        user={user}
        onBack={() =>
          setFacultyForChat(null)
        }
        onOpenChat={(project) => {
          onOpenChat({
            faculty: facultyForChat,
            project,
          });
        }}
      />
    );
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Dashboard
          </button>

          <p className="eyebrow">
            FACULTY DIRECTORY
          </p>

          <h1>
            Faculty Mentors 👩‍🏫
          </h1>

          <p>
            Find faculty members who can guide
            you with your projects, technical
            doubts and ideas.
          </p>
        </div>
      </div>

      {message && (
        <div className="auth-message">
          {message}
        </div>
      )}

      {loading ? (
        <div className="empty-projects">
          <div className="empty-project-icon">
            🔎
          </div>

          <h2>
            Loading faculty mentors...
          </h2>
        </div>
      ) : faculty.length === 0 ? (
        <div className="empty-projects">
          <div className="empty-project-icon">
            👩‍🏫
          </div>

          <h2>
            No faculty found
          </h2>

          <p>
            No faculty members are available
            from your university right now.
          </p>
        </div>
      ) : (
        <div className="candidate-grid">
          {faculty.map((member) => (
            <div
              className="candidate-card"
              key={member.id}
            >
              <div className="candidate-top">
                <div className="candidate-avatar">
                  {member.name
                    ?.charAt(0)
                    ?.toUpperCase() || "F"}
                </div>

                <div>
                  <h2>
                    {member.name ||
                      "Faculty Mentor"}
                  </h2>

                  <p>
                    {member.department ||
                      member.designation ||
                      "Faculty Mentor"}
                  </p>
                </div>
              </div>

              <div className="candidate-section">
                <label>
                  Expertise
                </label>

                <p>
                  {member.expertise ||
                    "Faculty member available for project guidance."}
                </p>
              </div>

              <div className="candidate-section">
                <label>
                  About
                </label>

                <p>
                  {member.bio ||
                    "Ask for guidance related to your project, technical doubts or ideas."}
                </p>
              </div>

              <div className="candidate-actions">
                <button
                  className="secondary-button"
                  onClick={() =>
                    setSelectedFaculty(member)
                  }
                >
                  View Profile
                </button>

                <button
                  className="primary-button"
                  onClick={() =>
                    openGuidance(member)
                  }
                >
                  💬 Ask for Guidance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFaculty && (
        <div
          className="profile-modal-overlay"
          onClick={() =>
            setSelectedFaculty(null)
          }
        >
          <div
            className="student-profile-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setSelectedFaculty(null)
              }
            >
              ×
            </button>

            <div className="large-student-avatar">
              {selectedFaculty.name
                ?.charAt(0)
                ?.toUpperCase() || "F"}
            </div>

            <h1>
              {selectedFaculty.name}
            </h1>

            <p className="profile-modal-subtitle">
              {selectedFaculty.department ||
                "Faculty Mentor"}
            </p>

            <div className="profile-modal-grid">
              <ProfileInfo
                title="Expertise"
                value={
                  selectedFaculty.expertise
                }
                icon="💻"
              />

              <ProfileInfo
                title="About"
                value={
                  selectedFaculty.bio
                }
                icon="🌸"
              />

              <ProfileInfo
                title="Designation"
                value={
                  selectedFaculty.designation
                }
                icon="👩‍🏫"
              />
            </div>

            <div className="profile-modal-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedFaculty(null)
                }
              >
                Close
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  setSelectedFaculty(null);
                  openGuidance(
                    selectedFaculty
                  );
                }}
              >
                💬 Ask for Guidance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FacultyProjectSelector({
  faculty,
  projects,
  onBack,
  onOpenChat,
}) {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <button
            className="back-button"
            onClick={onBack}
          >
            ← Faculty Mentors
          </button>

          <p className="eyebrow">
            FACULTY GUIDANCE
          </p>

          <h1>
            Chat with {faculty.name}
          </h1>

          <p>
            Select the project you need guidance
            with.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-projects">
          <div className="empty-project-icon">
            📁
          </div>

          <h2>
            Create a project first
          </h2>

          <p>
            You need a project before you can
            request faculty guidance.
          </p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              className="project-card"
              key={project.id}
            >
              <div className="project-card-top">
                <div className="project-icon">
                  📁
                </div>
              </div>

              <h2>
                {project.title}
              </h2>

              <p className="project-description">
                {project.description ||
                  "No description added yet."}
              </p>

              <button
                className="primary-button full-width"
                onClick={() =>
                  onOpenChat(project)
                }
              >
                💬 Open Chat
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FACULTY GUIDANCE / CHAT INBOX
========================================================= */

function FacultyGuidancePage({ user }) {

  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedContact, setSelectedContact] =
    useState(null);


  useEffect(() => {

    let cancelled = false;


    const loadContacts = async () => {

      try {

        setLoading(true);

        setError("");


        const response =
          await axios.get(
            `${API}/collaboration/faculty-contacts/${user.id}`
          );


        const data =
          Array.isArray(response.data)
            ? response.data
            : [];


        if (!cancelled) {

          setContacts(data);
        }

      } catch (error) {

        console.error(
          "Unable to load faculty chat contacts:",
          error
        );


        if (!cancelled) {

          setError(
            error.response?.data ||
            "Unable to load student conversations."
          );
        }

      } finally {

        if (!cancelled) {

          setLoading(false);
        }
      }
    };


    loadContacts();


    return () => {

      cancelled = true;
    };

  }, [user.id]);


  /*
   * When a student is selected, open the existing
   * project chat.
   */
  if (selectedContact) {

    const student = {

      id: selectedContact.studentId,

      name: selectedContact.studentName,

      email: selectedContact.studentEmail,
    };


    const project = {

      id: selectedContact.projectId,

      title:
        selectedContact.projectTitle ||
        "Student Guidance",

      description:
        "Faculty guidance conversation",
    };


    return (
      <ProjectChat
        user={user}
        project={project}
        otherUser={student}
        onClose={() =>
          setSelectedContact(null)
        }
      />
    );
  }


  return (
    <div className="page">

      <div className="page-heading">

        <div>

          <p className="eyebrow">
            FACULTY MESSAGES
          </p>

          <h1>
            Student Guidance 💬
          </h1>

          <p>
            Students who have contacted you for
            project guidance and technical help.
          </p>

        </div>

      </div>


      <div
        className="welcome-card"
        style={{
          marginBottom: "28px"
        }}
      >

        <div>

          <p className="eyebrow">
            GUIDANCE INBOX
          </p>

          <h2>
            Your student conversations
          </h2>

          <p>
            Only students who have actually
            contacted you appear here.
          </p>

        </div>


        <div className="welcome-icon">
          💬
        </div>

      </div>


      {error && (

        <div className="auth-message">
          {error}
        </div>

      )}


      {loading ? (

        <div className="empty-projects">

          <div className="empty-project-icon">
            💬
          </div>

          <h2>
            Loading conversations...
          </h2>

          <p>
            Checking for students who contacted you.
          </p>

        </div>

      ) : contacts.length === 0 ? (

        <div className="empty-projects">

          <div className="empty-project-icon">
            📭
          </div>

          <h2>
            No student conversations yet
          </h2>

          <p>
            When a student contacts you for
            guidance, they will appear here.
          </p>

        </div>

      ) : (

        <div className="candidate-grid">

          {contacts.map((contact) => (

            <div
              className="candidate-card"
              key={contact.studentId}
            >

              <div className="candidate-top">

                <div className="candidate-avatar">

                  {contact.studentName
                    ?.charAt(0)
                    ?.toUpperCase() || "S"}

                </div>


                <div>

                  <h2>
                    {contact.studentName}
                  </h2>

                  <p>
                    Student
                  </p>

                </div>

              </div>


              <div className="candidate-section">

                <label>
                  RECENT PROJECT
                </label>

                <h3
                  style={{
                    marginTop: "8px"
                  }}
                >
                  {contact.projectTitle ||
                    "Project guidance"}
                </h3>

              </div>


              <div
                style={{
                  marginTop: "14px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "#faf7ff",
                  border: "1px solid #eadff5"
                }}
              >

                <p
                  style={{
                    margin: 0,
                    color: "#5f5870",
                    lineHeight: 1.6
                  }}
                >
                  {contact.lastMessage ||
                    "Student contacted you for guidance."}
                </p>

              </div>


              <p
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#8b8399"
                }}
              >
                {contact.lastMessageAt
                  ? new Date(
                      contact.lastMessageAt
                    ).toLocaleString()
                  : ""}
              </p>


              <button
                className="primary-button full-width"
                style={{
                  marginTop: "10px"
                }}
                onClick={() =>
                  setSelectedContact(contact)
                }
              >
                💬 Open Chat & Reply
              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

/* =========================================================
   FACULTY PROJECTS
========================================================= */

function FacultyProjectsPage({ user }) {

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const load = async () => {

      try {

        const response =
          await axios.get(
            `${API}/projects/faculty/${user.id}`
          );

        if (Array.isArray(response.data)) {
          setProjects(response.data);
        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

    load();

  }, [user.id]);

  return (
    <div className="projects-page">

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            FACULTY
          </p>

          <h1>
            Student Projects
          </h1>

          <p>
            Projects from your university.
          </p>
        </div>
      </div>

      {loading ? (

        <div className="empty-projects">
          Loading projects...
        </div>

      ) : projects.length === 0 ? (

        <div className="empty-projects">
          <div className="empty-project-icon">
            📁
          </div>

          <h2>
            No student projects yet
          </h2>

        </div>

      ) : (

        <div className="projects-grid">

          {projects.map((project) => (
            <div
              className="project-card"
              key={project.id}
            >

              <div className="project-card-top">
                <div className="project-icon">
                  📁
                </div>

                <span
                  className={`project-status ${String(
                    project.status ||
                      "PLANNING"
                  ).toLowerCase()}`}
                >
                  {String(
                    project.status ||
                      "PLANNING"
                  ).replace("_", " ")}
                </span>
              </div>

              <h2>{project.title}</h2>

              <p className="project-description">
                {project.description ||
                  "No description."}
              </p>

              <div className="project-detail">
                <span>
                  Required Skills
                </span>

                <p>
                  {project.requiredSkills ||
                    "Not specified"}
                </p>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}


/* =========================================================
   OPPORTUNITIES PAGE
========================================================= */

function OpportunitiesPage({ user }) {

  const [opportunities, setOpportunities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingOpportunity, setEditingOpportunity] =
    useState(null);

  const emptyForm = {
    title: "",
    organization: "",
    type: "HACKATHON",
    description: "",
    skills: "",
    deadline: "",
    registrationLink: "",
    status: "OPEN",
  };

  const [form, setForm] =
    useState(emptyForm);


  // =========================================================
  // LOAD OPPORTUNITIES
  // =========================================================

  const loadOpportunities = async () => {

    try {

      setLoading(true);

      const response =
        await axios.get(
          `${API}/opportunities/user/${user.id}`
        );


      setOpportunities(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Unable to load opportunities:",
        error
      );

      setMessage(
        "Unable to load opportunities."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    loadOpportunities();

  }, [user.id]);


  // =========================================================
  // FORM
  // =========================================================

  const updateForm = (event) => {

    const {
      name,
      value
    } = event.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const openCreate = () => {

    setEditingOpportunity(null);

    setForm(emptyForm);

    setMessage("");

    setShowForm(true);
  };


  const openEdit = (opportunity) => {

    setEditingOpportunity(
      opportunity
    );


    setForm({

      title:
        opportunity.title || "",

      organization:
        opportunity.organization || "",

      type:
        opportunity.type || "HACKATHON",

      description:
        opportunity.description || "",

      skills:
        opportunity.skills || "",

      deadline:
        opportunity.deadline || "",

      registrationLink:
        opportunity.registrationLink || "",

      status:
        opportunity.status || "OPEN",
    });


    setMessage("");

    setShowForm(true);
  };


  const closeForm = () => {

    setShowForm(false);

    setEditingOpportunity(null);

    setForm(emptyForm);
  };


  // =========================================================
  // SAVE
  // =========================================================

  const saveOpportunity = async (event) => {

    event.preventDefault();

    setMessage("");


    if (!form.title.trim()) {

      setMessage(
        "Please enter an opportunity title."
      );

      return;
    }


    try {

      const payload = {

        userId: user.id,

        title:
          form.title.trim(),

        organization:
          form.organization.trim(),

        type:
          form.type,

        description:
          form.description,

        skills:
          form.skills,

        deadline:
          form.deadline || null,

        registrationLink:
          form.registrationLink,

        status:
          form.status,
      };


      if (editingOpportunity) {

        await axios.put(

          `${API}/opportunities/${editingOpportunity.id}`,

          payload
        );


        setMessage(
          "Opportunity updated successfully."
        );

      } else {

        await axios.post(

          `${API}/opportunities`,

          payload
        );


        setMessage(
          "Opportunity created successfully."
        );
      }


      await loadOpportunities();


      setTimeout(() => {

        closeForm();

      }, 500);


    } catch (error) {

      console.error(
        "Opportunity save error:",
        error
      );


      setMessage(

        typeof error.response?.data ===
          "string"

          ? error.response.data

          : error.response?.data?.message ||

            "Unable to save opportunity."
      );
    }
  };


  // =========================================================
  // DELETE
  // =========================================================

  const deleteOpportunity = async (
    opportunity
  ) => {

    const confirmed =
      window.confirm(
        `Delete "${opportunity.title}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await axios.delete(

        `${API}/opportunities/${opportunity.id}`,

        {
          params: {
            userId: user.id,
          },
        }
      );


      await loadOpportunities();


      setMessage(
        "Opportunity deleted successfully."
      );


    } catch (error) {

      console.error(
        "Opportunity delete error:",
        error
      );


      setMessage(
        typeof error.response?.data ===
          "string"

          ? error.response.data

          : "Unable to delete opportunity."
      );
    }
  };


  // =========================================================
  // FACULTY FORM
  // =========================================================

  if (
    user.role === "FACULTY" &&
    showForm
  ) {

    return (
      <div className="page">

        <div className="page-heading">

          <div>

            <button
              className="back-button"
              onClick={closeForm}
            >
              ← Opportunities
            </button>

            <p className="eyebrow">
              FACULTY / ORGANIZER
            </p>

            <h1>
              {editingOpportunity
                ? "Edit Opportunity"
                : "Create Opportunity"}
            </h1>

            <p>
              Publish a college opportunity
              for students to discover.
            </p>

          </div>

        </div>


        {message && (

          <div className="project-message success-message">
            {message}
          </div>

        )}


        <form
          className="project-form-card"
          onSubmit={saveOpportunity}
        >

          <div className="project-form-grid">

            <div className="form-field">

              <label>
                Opportunity Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                placeholder="e.g. AI Innovation Hackathon"
                required
              />

            </div>


            <div className="form-field">

              <label>
                Organization
              </label>

              <input
                name="organization"
                value={form.organization}
                onChange={updateForm}
                placeholder="e.g. Neural Nexus"
              />

            </div>


            <div className="form-field">

              <label>
                Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={updateForm}
              >

                <option value="HACKATHON">
                  Hackathon
                </option>

                <option value="INTERNSHIP">
                  Internship
                </option>

                <option value="WORKSHOP">
                  Workshop
                </option>

                <option value="COMPETITION">
                  Competition
                </option>

                <option value="SEMINAR">
                  Seminar
                </option>

                <option value="EVENT">
                  Event
                </option>

                <option value="OTHER">
                  Other
                </option>

              </select>

            </div>


            <div className="form-field">

              <label>
                Deadline
              </label>

              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={updateForm}
              />

            </div>


            <div className="form-field form-field-wide">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Describe the opportunity, eligibility, dates, benefits, etc."
                rows="5"
              />

            </div>


            <div className="form-field form-field-wide">

              <label>
                Skills / Eligibility
              </label>

              <input
                name="skills"
                value={form.skills}
                onChange={updateForm}
                placeholder="Python, AI, React, Open to all departments..."
              />

            </div>


            <div className="form-field form-field-wide">

              <label>
                Registration Link
              </label>

              <input
                name="registrationLink"
                type="url"
                value={form.registrationLink}
                onChange={updateForm}
                placeholder="https://..."
              />

            </div>


            <div className="form-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={updateForm}
              >

                <option value="OPEN">
                  Open
                </option>

                <option value="UPCOMING">
                  Upcoming
                </option>

                <option value="CLOSED">
                  Closed
                </option>

              </select>

            </div>

          </div>


          <div className="project-form-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={closeForm}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="primary-button"
            >
              {editingOpportunity
                ? "Update Opportunity"
                : "Publish Opportunity"}
            </button>

          </div>

        </form>

      </div>
    );
  }


  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="page">

      <div className="page-heading">

        <div>

          <p className="eyebrow">
            OPPORTUNITIES
          </p>

          <h1>
            Discover Opportunities 🎯
          </h1>

          <p>
            Hackathons, internships,
            workshops, competitions and
            college events.
          </p>

        </div>


        {user.role === "FACULTY" && (

          <button
            className="primary-button"
            onClick={openCreate}
          >
            + Create Opportunity
          </button>

        )}

      </div>


      {message && (

        <div className="project-message success-message">
          {message}
        </div>

      )}


      {loading ? (

        <div className="empty-projects">

          <div className="empty-project-icon">
            🎯
          </div>

          <h2>
            Loading opportunities...
          </h2>

          <p>
            Finding opportunities from
            your university.
          </p>

        </div>

      ) : opportunities.length === 0 ? (

        <div className="empty-projects">

          <div className="empty-project-icon">
            🎯
          </div>

          <h2>
            No opportunities yet
          </h2>

          <p>
            {user.role === "FACULTY"
              ? "Create your first opportunity for students."
              : "No opportunities have been published by your university yet."}
          </p>


          {user.role === "FACULTY" && (

            <button
              className="primary-button"
              onClick={openCreate}
            >
              + Create Opportunity
            </button>

          )}

        </div>

      ) : (

        <div className="opportunities-grid">

          {opportunities.map(
            (opportunity) => (

              <OpportunityCard

                key={opportunity.id}

                opportunity={
                  opportunity
                }

                isFaculty={
                  user.role === "FACULTY"
                }

                isOwner={
                  user.role === "FACULTY" &&
                  Number(
                    opportunity.createdById
                  ) ===
                    Number(user.id)
                }

                onEdit={() =>
                  openEdit(opportunity)
                }

                onDelete={() =>
                  deleteOpportunity(
                    opportunity
                  )
                }

              />

            )
          )}

        </div>

      )}

    </div>
  );
}


function OpportunityCard({
  opportunity,
  isFaculty,
  isOwner,
  onEdit,
  onDelete,
}) {

  const deadline =
    opportunity.deadline
      ? new Date(
          `${opportunity.deadline}T00:00:00`
        )
      : null;


  const isPast =
    deadline &&
    deadline < new Date();


  const status =
    opportunity.status ||
    "OPEN";


  return (
    <div className="opportunity-card">

      <div className="opportunity-card-top">

        <div className="opportunity-icon">
          🎯
        </div>


        <span
          className={`opportunity-status ${status.toLowerCase()}`}
        >
          {status.replace("_", " ")}
        </span>

      </div>


      <div className="opportunity-type">

        {opportunity.type ||
          "OPPORTUNITY"}

      </div>


      <h2>
        {opportunity.title}
      </h2>


      {opportunity.organization && (

        <p className="opportunity-organization">
          🏢 {opportunity.organization}
        </p>

      )}


      <p className="opportunity-description">

        {opportunity.description ||
          "No description provided."}

      </p>


      {opportunity.skills && (

        <div className="opportunity-detail">

          <span>
            SKILLS / ELIGIBILITY
          </span>

          <p>
            {opportunity.skills}
          </p>

        </div>

      )}


      {deadline && (

        <div className="opportunity-deadline">

          <span>
            📅 DEADLINE
          </span>

          <strong
            className={
              isPast
                ? "deadline-past"
                : ""
            }
          >
            {deadline.toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}
          </strong>

        </div>

      )}


      <div className="opportunity-actions">

        {opportunity.registrationLink && (

          <a
            href={
              opportunity.registrationLink
            }
            target="_blank"
            rel="noreferrer"
            className="primary-button"
          >
            Register / Apply →
          </a>

        )}


        {isFaculty && isOwner && (

          <>

            <button
              className="secondary-button"
              onClick={onEdit}
            >
              Edit
            </button>


            <button
              className="danger-button"
              onClick={onDelete}
            >
              Delete
            </button>

          </>

        )}

      </div>


      {opportunity.createdByName && (

        <p className="opportunity-created-by">
          Posted by {opportunity.createdByName}
        </p>

      )}

    </div>
  );
}


/* =========================================================
   SIMPLE PAGE
========================================================= */

function SimplePage({
  title,
  subtitle,
  icon,
}) {

  return (
    <div className="page">

      <div className="page-heading">
        <div>

          <p className="eyebrow">
            SKILLSYNC
          </p>

          <h1>{title}</h1>

          <p>{subtitle}</p>

        </div>
      </div>

      <div className="empty-projects">

        <div className="empty-project-icon">
          {icon}
        </div>

        <h2>
          Coming next
        </h2>

        <p>
          This module is being built
          as part of SkillSync.
        </p>

      </div>
    </div>
  );
}

export default App;