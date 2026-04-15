'use client'

import { about } from '@/content/about'

export default function MobileScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-black px-6 text-center">
      <div className="mb-6 text-5xl">💻</div>
      <h1 className="mb-2 text-xl font-semibold text-white">{about.name}</h1>
      <p className="mb-1 text-sm text-gray-400">{about.title}</p>
      <p className="mb-8 text-xs text-gray-600">This experience is designed for desktop.</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href={`mailto:${about.email}`}
          className="rounded-lg border border-gray-700 px-4 py-3 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
        >
          {about.email}
        </a>
        <a
          href={about.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-700 px-4 py-3 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
        >
          GitHub
        </a>
        <a
          href="/resume.pdf"
          download
          className="rounded-lg border border-gray-700 px-4 py-3 text-sm text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
        >
          Download Resume
        </a>
      </div>
      <p className="mt-10 text-xs text-gray-700">Best viewed on a desktop browser at 1024px+</p>
    </div>
  )
}
