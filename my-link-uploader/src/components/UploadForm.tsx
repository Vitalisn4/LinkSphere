import React, { useState, ChangeEvent, FormEvent } from "react";
import './components/UploadForm.css';

interface FormData {
  link: string;
  topic: string;
  description: string;
  uploader: string;
}

interface FormErrors {
  link?: string;
  topic?: string;
  description?: string;
  uploader?: string;
}

const UploadForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    link: "",
    topic: "",
    description: "",
    uploader: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.link) {
      newErrors.link = "Link is required.";
    } else if (!/^https?:\/\/\S+$/.test(formData.link)) {
      newErrors.link = "Enter a valid URL.";
    }

    if (!formData.topic) newErrors.topic = "Topic is required.";
    if (!formData.description) newErrors.description = "Description is required.";
    if (!formData.uploader) newErrors.uploader = "Uploader name is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // clear field error
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    console.log("Form submitted:", formData);
    alert("Form submitted successfully!");
    // Optionally reset form
    setFormData({ link: "", topic: "", description: "", uploader: "" });
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
            className={errors.link ? "error" : ""}
            required
          />
          {errors.link && <span className="error-text">{errors.link}</span>}
        </label>

        <label>
          Topic:
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className={errors.topic ? "error" : ""}
            required
          />
          {errors.topic && <span className="error-text">{errors.topic}</span>}
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
            required
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </label>

        <label>
          Uploader:
          <input
            type="text"
            name="uploader"
            value={formData.uploader}
            onChange={handleChange}
            className={errors.uploader ? "error" : ""}
            required
          />
          {errors.uploader && <span className="error-text">{errors.uploader}</span>}
        </label>

        <button type="submit">Submit Link</button>
      </form>
    </div>
  );
};

export default UploadForm;
