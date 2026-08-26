import React from 'react';
import { getInitials } from '../../utils/initials';

interface AvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackRole?: string; // used for fallback initials e.g. "US" if name is missing
}

export const Avatar: React.FC<AvatarProps> = ({ name, avatarUrl, size = 'md', className = '', fallbackRole = '??' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const baseClasses = `rounded-full flex items-center justify-center font-bold shrink-0 shadow-xs object-cover ${sizeClasses[size]} ${className}`;
  const initialString = getInitials(name, fallbackRole);

  // Fallback to initials if avatarUrl exists but image fails to load
  const [imageError, setImageError] = React.useState(false);

  if (avatarUrl && !imageError) {
    return (
      <img 
        src={avatarUrl.startsWith('/') || avatarUrl.startsWith('http') ? avatarUrl : `/${avatarUrl}`} 
        alt={name || 'User Avatar'} 
        className={baseClasses}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`bg-gradient-to-br from-indigo-500 to-purple-600 text-white ${baseClasses}`}>
      {initialString}
    </div>
  );
};
