import { useState } from "react";
import axios from "axios";

function StudentProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    skills: "",
    interests: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/api/students", {
        ...form,
        year: Number(form.year)
      });

      setMessage("Profile created successfully! 🎉");

      setForm({
        name: "",
        email: "",
        department: "",
        year: "",
        skills: "",
        interests: ""
      });
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please check the backend.");
    }
  };

  return (
    <div className="profile-page">

      <div className="profile-card">

        <div className="profile-header">
          <p>SKILLSYNC</p>
          <h1>Create Your Profile 👋</h1>
          <span>
            Tell us about yourself so we can help you find the right
            projects and teammates.
          </span>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label>Department</label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="e.g. Artificial Intelligence"
            required
          />

          <label>Year</label>
          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            required
          >
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <label>Skills</label>
          <input
            type="text"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="e.g. Python, Java, React, ML"
          />

          <label>Interests</label>
          <input
            type="text"
            name="interests"
            value={form.interests}
            onChange={handleChange}
            placeholder="e.g. AI, Web Development, Hackathons"
          />

          <button type="submit">
            Create Profile →
          </button>

        </form>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

      </div>

    </div>
  );
}

export default StudentProfile;