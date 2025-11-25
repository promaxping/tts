
import React from 'react';

export const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M4.5 12.502a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1.879a.5.5 0 0 0 .353-.147l3.106-3.106a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1 0 1.414L8.853 11H4.5v1.502Zm1.94-1.502a.5.5 0 0 0 0 .707l.707.707a.5.5 0 0 0 .707 0L10 10.306V11H6.44v.002Z" />
    <path d="M14 12.5a4.48 4.48 0 0 0 1.133-3.143a1 1 0 0 1 1.986-.226a6.5 6.5 0 0 1-9.2 8.483a1 1 0 1 1 1.344-1.48a4.5 4.5 0 0 0 6.32-5.918L14 12.5Z" />
    <path d="M16.5 12.5a7.01 7.01 0 0 0-1.92-4.99a1 1 0 1 1 1.44-1.385A9 9 0 0 1 9.5 20.94a1 1 0 0 1-1-1.705A7 7 0 0 0 16.5 12.5Z" />
  </svg>
);
