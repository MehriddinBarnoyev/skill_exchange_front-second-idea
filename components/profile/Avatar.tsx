import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface AvatarProps {
  src: string
  alt: string
}

export function Avatar({ src, alt }: AvatarProps) {
  return (
    <UIAvatar className="w-24 h-24">
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{alt[0]}</AvatarFallback>
    </UIAvatar>
  )
}

