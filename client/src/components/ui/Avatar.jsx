const sizes = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-16 w-16 text-xl',
};

export default function Avatar({ name = 'Member', src, size = 'md' }) {
  const label = (typeof name === 'string' && name.trim()) ? name.trim() : 'Member';
  const classes = sizes[size] || sizes.md;
  if (typeof src === 'string' && src.startsWith('https://')) {
    return <img src={src} alt={`Profile photo of ${label}`} className={`${classes} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span
      role="img"
      aria-label={`${label} has no profile photo`}
      className={`${classes} inline-flex shrink-0 items-center justify-center rounded-full bg-[#efe3e9] font-semibold text-[#713652]`}
    >
      {Array.from(label)[0].toLocaleUpperCase()}
    </span>
  );
}
