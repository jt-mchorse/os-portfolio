'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function ResumeApp({ windowId }: { windowId: string; meta?: Record<string, unknown> }) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(0.85)

  return (
    <div className="flex flex-col h-full text-white" style={{ background: '#2a2a2a' }}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-white/10 flex-shrink-0"
        style={{ background: '#252525' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            ‹ Prev
          </button>
          <span className="text-xs text-white/60">
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-2 py-1 rounded text-xs disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            Next ›
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-white/10"
          >
            −
          </button>
          <span className="text-xs text-white/60 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-white/10"
          >
            +
          </button>

          <a
            href="/resume.pdf"
            download="James_McHorse_Resume.pdf"
            className="ml-2 px-3 py-1 rounded text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-all"
          >
            Download
          </a>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 overflow-auto flex justify-center macos-scrollbar" style={{ background: '#3a3a3a' }}>
        <div className="py-4">
          <Document
            file="/resume.pdf"
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={
              <div className="flex items-center justify-center p-20 text-white/40 text-sm">
                Loading resume…
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center p-20 gap-3">
                <span className="text-white/40 text-sm">PDF preview unavailable</span>
                <a href="/resume.pdf" download className="text-blue-400 text-sm hover:text-blue-300">
                  Download Resume
                </a>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
      </div>
    </div>
  )
}
