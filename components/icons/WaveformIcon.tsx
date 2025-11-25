
import React from 'react';

export const WaveformIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M3.375 12C3.375 12.4142 3.71079 12.75 4.125 12.75H5.25V11.25H4.125C3.71079 11.25 3.375 11.5858 3.375 12Z" />
    <path d="M6 12C6 10.067 7.567 8.5 9.5 8.5V15.5C7.567 15.5 6 13.933 6 12Z" />
    <path d="M10.25 17.5C12.4591 17.5 14.25 15.7091 14.25 13.5V10.5C14.25 8.29086 12.4591 6.5 10.25 6.5V17.5Z" />
    <path d="M15 12C15 13.933 16.567 15.5 18.5 15.5V8.5C16.567 8.5 15 10.067 15 12Z" />
    <path d="M19.5 12C19.5 11.5858 19.8358 11.25 20.25 11.25H21.375V12.75H20.25C19.8358 12.75 19.5 12.4142 19.5 12Z" />
  </svg>
);
