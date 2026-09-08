"use client";

import { FileText, Upload } from "lucide-react";

export default function FilesPage() {
  return (
    <main className="dashboard-page">

      <div className="page-header">
        <div>
          <h1>Files</h1>
          <p className="page-description">
            Upload and manage your meeting files.
          </p>
        </div>

        <button className="primary-button">
          <Upload size={18} />
          Upload File
        </button>
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <FileText size={42} />
        </div>
        <h2>No files yet</h2>
        <p>
          Your uploaded meeting files will appear here.
        </p>
      </div>

    </main>
  );
}