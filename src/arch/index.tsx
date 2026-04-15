'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const ArchTerminal = dynamic(() => import('./terminal/ArchTerminal'), { ssr: false })

function PDFOverlay({ onClose }: { onClose: () => void }) {
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
    >
      <div
        className="flex flex-col rounded-xl overflow-hidden shadow-2xl"
        style={{ width: '720px', maxHeight: '90vh', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{ background: '#222' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="text-xs text-white/60 hover:text-white disabled:opacity-30">‹ Prev</button>
            <span className="text-xs text-white/50">{page} / {numPages}</span>
            <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages} className="text-xs text-white/60 hover:text-white disabled:opacity-30">Next ›</button>
          </div>
          <div className="flex items-center gap-3">
            <a href="/resume.pdf" download className="text-xs text-blue-400 hover:text-blue-300">Download</a>
            <button onClick={onClose} className="text-xs text-white/50 hover:text-white px-2 py-1 rounded hover:bg-white/10">✕ Close</button>
          </div>
        </div>
        {/* PDF */}
        <div className="flex-1 overflow-auto flex justify-center p-4" style={{ background: '#333' }}>
          <Document file="/resume.pdf" onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={page} scale={0.85} />
          </Document>
        </div>
      </div>
    </motion.div>
  )
}

export default function ArchDesktop() {
  const [showPDF, setShowPDF] = useState(false)

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0d0d0d' }}>
      <ArchTerminal onOpenPDF={() => setShowPDF(true)} />
      <AnimatePresence>
        {showPDF && <PDFOverlay onClose={() => setShowPDF(false)} />}
      </AnimatePresence>
    </div>
  )
}
