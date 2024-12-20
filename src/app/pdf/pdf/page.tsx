"use client";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function ViewerPDF() {
  return (
    <main>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
        <div>
          <Viewer fileUrl={"/dummy.pdf"} />
        </div>
      </Worker>
    </main>
  );
}