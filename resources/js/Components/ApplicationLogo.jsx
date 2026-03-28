export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <svg
            {...props}
            className={className}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
            <path
                d="M20 8L8 18H12V30H18V23H22V30H28V18H32L20 8Z"
                fill="white"
                fillOpacity="0.95"
            />
            <path
                d="M18 23H22V18H18V23Z"
                fill="url(#logo-gradient)"
                fillOpacity="0.6"
            />
            <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
            </defs>
        </svg>
    );
}
