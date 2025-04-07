import React, { useState } from "react";
import "./UploadForm.css";

const UploadForm = () => {
  const [formData, setFormData] = useState({
    link: "",
    topic: "",
    description: "",
    uploader: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted data:", formData);
  };

  return (
    <div className="upload-form-background">
      <h1 className="upload-form-title">Welcome</h1>
      <div className="upload-form-container">
        <form onSubmit={handleSubmit} className="upload-form">
          <h2>Upload form</h2>
          <label>
            <input name="link" placeholder="Link" onChange={handleChange} />
          </label>
          <label>
            <input name="topic" placeholder="Topic" onChange={handleChange} />
          </label>
          <label>
            <textarea name="description" placeholder="Description" onChange={handleChange} />
          </label>
          <label>
            <input name="uploader" placeholder="Uploader" onChange={handleChange} />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;
