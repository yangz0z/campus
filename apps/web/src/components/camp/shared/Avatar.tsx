interface AvatarProps {
  nickname: string;
  profileImage: string | null;
  size?: number;
}

export default function Avatar({ nickname, profileImage, size = 24 }: AvatarProps) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profileImage} alt={nickname} style={style} className="avatar rounded-full object-cover ring-1 ring-white" />
    );
  }
  return (
    <span
      style={style}
      className="avatar avatar--initial flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 ring-1 ring-white"
    >
      {nickname[0]}
    </span>
  );
}
