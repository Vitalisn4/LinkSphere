import React, { useState, ChangeEvent, FormEvent } from "react";
import './components/UploadForm.css';
import AdminDashboard from './components/AdminDashboard';
 // optional if you want to style it

interface FormData {
  link: string;
  topic: string;
  description: string;
  uploader: string;
}

const UploadForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    link: "",
    topic: "",
    description: "",
    uploader: "",
  });
    
    const App: React.FC = () => {
  return <AdminDashboard />;
};

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Form submitted successfully!");
  };

  return (
    <div className="upload-form-container">
      <h1>Welcome to Link Upload</h1>
      <p className="form-description">
        Submit a useful link with its topic, description, and your name.
      </p>

      <form className="upload-form" onSubmit={handleSubmit}>
        <label>
          Link:
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Topic:
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Uploader:
          <input
            type="text"
            name="uploader"
            value={formData.uploader}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Submit Link</button>
      </form>
    </div>
  );
};

export default UploadForm;
export default App;