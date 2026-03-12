import React from 'react';

interface IconProps {
  className?: string;
  active?: boolean;
}

/** Mosque dome + minaret silhouette */
export const IconHome: React.FC<IconProps> = ({ className, active }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <>
        {/* Filled mosque */}
        <path d="M12 2C12 2 8 6 8 8V10H5V8L3 10V20H10V16C10 14.9 10.9 14 12 14C13.1 14 14 14.9 14 16V20H21V10L19 8V10H16V8C16 6 12 2 12 2Z" fill="currentColor"/>
        <rect x="3" y="20" width="18" height="2" rx="1" fill="currentColor"/>
        <circle cx="12" cy="7" r="1.5" fill="currentColor" opacity="0.5"/>
      </>
    ) : (
      <>
        <path d="M12 3C12 3 8.5 6.5 8.5 8.5V10H5.5V8.5L3.5 10.5V19.5H10V16C10 14.9 10.9 14 12 14C13.1 14 14 14.9 14 16V19.5H20.5V10.5L18.5 8.5V10H15.5V8.5C15.5 6.5 12 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="3.5" y="19.5" width="17" height="1.5" rx="0.75" stroke="currentColor" strokeWidth="1.5"/>
      </>
    )}
  </svg>
);

/** Crescent moon + star — Islamic symbol */
export const IconIman: React.FC<IconProps> = ({ className, active }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <>
        <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C14.12 21 16.07 20.24 17.56 18.97C13.53 18.56 10.5 15.3 10.5 11.5C10.5 7.7 13.53 4.44 17.56 4.03C16.07 2.76 14.12 2 12 2V3Z" fill="currentColor"/>
        <path d="M18 7L18.7 9.3L21 10L18.7 10.7L18 13L17.3 10.7L15 10L17.3 9.3L18 7Z" fill="currentColor"/>
      </>
    ) : (
      <>
        <path d="M12 3.5C7.31 3.5 3.5 7.31 3.5 12C3.5 16.69 7.31 20.5 12 20.5C14.02 20.5 15.87 19.78 17.3 18.58C13.6 18.1 10.75 15.08 10.75 11.5C10.75 7.92 13.6 4.9 17.3 4.42C15.87 3.22 14.02 2.5 12 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 7L18.7 9.3L21 10L18.7 10.7L18 13L17.3 10.7L15 10L17.3 9.3L18 7Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

/** Heart with pulse/ECG line */
export const IconHealth: React.FC<IconProps> = ({ className, active }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <>
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
        {/* Pulse line cutout effect */}
        <path d="M4 12H8L9.5 9L12 15L14.5 11L16 12H20" stroke="var(--background, #fff)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <path d="M12 20.35L10.55 19.03C5.4 14.36 2 11.28 2 7.5C2 4.42 4.42 2 7.5 2C9.24 2 10.91 2.81 12 4.09C13.09 2.81 14.76 2 16.5 2C19.58 2 22 4.42 22 7.5C22 11.28 18.6 14.36 13.45 19.04L12 20.35Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 11H8L9.5 8L12 14L14.5 10L16 11H19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

/** Stacked coins */
export const IconWealth: React.FC<IconProps> = ({ className, active }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <>
        <ellipse cx="12" cy="7" rx="7" ry="3" fill="currentColor"/>
        <path d="M5 7V11C5 12.66 8.13 14 12 14C15.87 14 19 12.66 19 11V7" fill="currentColor"/>
        <path d="M5 11V15C5 16.66 8.13 18 12 18C15.87 18 19 16.66 19 15V11" fill="currentColor"/>
        <path d="M5 15V19C5 20.66 8.13 22 12 22C15.87 22 19 20.66 19 19V15" fill="currentColor"/>
        {/* Coin separation lines */}
        <ellipse cx="12" cy="11" rx="7" ry="3" fill="currentColor" opacity="0.85"/>
        <ellipse cx="12" cy="15" rx="7" ry="3" fill="currentColor" opacity="0.7"/>
        <ellipse cx="12" cy="19" rx="7" ry="3" fill="currentColor" opacity="0.55"/>
      </>
    ) : (
      <>
        <ellipse cx="12" cy="6" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 6V10C5 11.66 8.13 13 12 13C15.87 13 19 11.66 19 10V6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 10V14C5 15.66 8.13 17 12 17C15.87 17 19 15.66 19 14V10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 14V18C5 19.66 8.13 21 12 21C15.87 21 19 19.66 19 18V14" stroke="currentColor" strokeWidth="1.5"/>
      </>
    )}
  </svg>
);

/** Clipboard with checkmark */
export const IconTasks: React.FC<IconProps> = ({ className, active }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <>
        <path d="M9 2C8.45 2 8 2.45 8 3H6C4.9 3 4 3.9 4 5V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V5C20 3.9 19.1 3 18 3H16C16 2.45 15.55 2 15 2H9Z" fill="currentColor"/>
        <rect x="8.5" y="1.5" width="7" height="3" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
        {/* Checkmark */}
        <path d="M8.5 13L11 15.5L15.5 10" stroke="var(--background, #fff)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <path d="M9 2.5C8.72 2.5 8.5 2.72 8.5 3V3.5H6C5.17 3.5 4.5 4.17 4.5 5V20C4.5 20.83 5.17 21.5 6 21.5H18C18.83 21.5 19.5 20.83 19.5 20V5C19.5 4.17 18.83 3.5 18 3.5H15.5V3C15.5 2.72 15.28 2.5 15 2.5H9Z" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="8.5" y="2" width="7" height="3" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8.5 13L11 15.5L15.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    )}
  </svg>
);

/** Two people silhouette */
export const IconFamily: React.FC<IconProps> = ({ className, active }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <>
        {/* Person 1 */}
        <circle cx="9" cy="7" r="3.5" fill="currentColor"/>
        <path d="M2 19C2 15.69 5.13 13 9 13C12.87 13 16 15.69 16 19V20H2V19Z" fill="currentColor"/>
        {/* Person 2 (behind) */}
        <circle cx="17" cy="8" r="2.5" fill="currentColor" opacity="0.7"/>
        <path d="M14 20V19C14 17.5 13.2 16.1 11.9 15.1C13.3 14.4 15 14 17 14C20 14 22 15.8 22 18V20H14Z" fill="currentColor" opacity="0.7"/>
      </>
    ) : (
      <>
        <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 19.5C2.5 16.19 5.41 13.5 9 13.5C12.59 13.5 15.5 16.19 15.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="17" cy="8.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M15 19.5C15 17.5 14 15.8 12.5 14.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M21.5 19.5C21.5 17 19.5 14.5 17 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    )}
  </svg>
);

/** Gear / cog for settings */
export const IconProfile: React.FC<IconProps> = ({ className, active }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {active ? (
      <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5ZM19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.72 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.28 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98Z" fill="currentColor"/>
    ) : (
      <>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5ZM19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.72 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.28 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98Z" stroke="currentColor" strokeWidth="1.5"/>
      </>
    )}
  </svg>
);
