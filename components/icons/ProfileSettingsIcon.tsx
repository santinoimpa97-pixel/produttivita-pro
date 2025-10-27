import React from 'react';

export const ProfileSettingsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.226l.55-.22a2.25 2.25 0 0 1 2.158 0l.55.22a1.125 1.125 0 0 0 1.11 1.226c.542.09 1.007.56 1.226 1.11l.22.55a2.25 2.25 0 0 1 0 2.158l-.22.55a1.125 1.125 0 0 0-1.226 1.11c-.09.542-.56 1.007-1.11 1.226l-.55.22a2.25 2.25 0 0 1-2.158 0l-.55-.22a1.125 1.125 0 0 0-1.11-1.226c-.542-.09-1.007-.56-1.226-1.11l-.22-.55a2.25 2.25 0 0 1 0-2.158l.22-.55a1.125 1.125 0 0 0 1.226-1.11ZM12 10.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM12 15a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);
