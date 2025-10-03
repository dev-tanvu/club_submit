import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET"; // replace
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME"; // replace
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvdBYaHdV9Se9iLj2quqaSe4OchaerBGmn9DzZA98XmqqiFkkteYmwBKe1LIrGPKf2pg/exec"; 

const LandingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullNameBengali: "",
    fullNameEnglish: "",
    institutionName: "",
    class: "",
    email: "",
    phone: "",
    whatsapp: "",
  });

  const [category, setCategory] = useState("Landscape");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  // upload to cloudinary
  const uploadToCloudinary = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );

    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    throw new Error("Upload failed");
  };

  // submit to google sheets
  const submitToGoogleSheets = async (
    formData: any,
    imageUrls: string[],
    category: string
  ) => {
    const submissionData = {
      category,
      ...formData,
      imageUrls: imageUrls.join(", "),
      timestamp: new Date().toISOString(),
    };

    const params = new URLSearchParams(submissionData).toString();
    const url = `${GOOGLE_SCRIPT_URL}?${params}`;

    const res = await fetch(url);
    const data = await res.json();
    return data;
  };

  // form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploading(true);
      setStatus("Uploading images...");

      // upload all files
      const imageUrls: string[] = [];
      for (const file of files) {
        const url = await uploadToCloudinary(file);
        imageUrls.push(url);
      }

      setStatus("Submitting form...");

      // send to google sheets
      const result = await submitToGoogleSheets(formData, imageUrls, category);

      if (result.success) {
        setStatus("✅ Submission successful!");
        setFormData({
          fullNameBengali: "",
          fullNameEnglish: "",
          institutionName: "",
          class: "",
          email: "",
          phone: "",
          whatsapp: "",
        });
        setFiles([]);
      } else {
        setStatus("❌ Submission failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Photography Contest</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="Landscape">Landscape</option>
          <option value="Portrait">Portrait</option>
          <option value="Wildlife">Wildlife</option>
        </select>

        <input
          type="text"
          name="fullNameBengali"
          placeholder="Full Name (Bengali)"
          value={formData.fullNameBengali}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="fullNameEnglish"
          placeholder="Full Name (English)"
          value={formData.fullNameEnglish}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="institutionName"
          placeholder="Institution Name"
          value={formData.institutionName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="class"
          placeholder="Class"
          value={formData.class}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="tel"
          name="whatsapp"
          placeholder="WhatsApp Number"
          value={formData.whatsapp}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* dropzone */}
        <div
          {...getRootProps()}
          className="w-full p-6 border-2 border-dashed rounded text-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <p>Drag & drop images here, or click to select</p>
        </div>

        {/* preview */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {files.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-24 object-cover rounded"
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {uploading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {status && <p className="mt-4 text-center">{status}</p>}
    </div>
  );
};

export default LandingPage;
