import { useHover } from "../../hooks/useHover"
import { Avatar } from "./Avatar"
import { UploadButton } from "./UploadBtn"


interface UserAvatarProps {
  src: string
  alt: string
  onUpload: (file: File) => Promise<void>
}

export function UserAvatar({ src, alt, onUpload }: UserAvatarProps) {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>()

  return (
    <div ref={hoverRef} className="relative inline-block">
      <Avatar src={src} alt={alt} />
      {isHovered && <UploadButton onUpload={onUpload} />}
    </div>
  )
}

