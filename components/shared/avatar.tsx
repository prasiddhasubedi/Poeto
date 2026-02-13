import * as React from "react"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
}

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 32,
  xl: 48,
}

export function Avatar({ src, alt = "User avatar", size = "md", className }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)

  const showFallback = !src || imageError

  return (
    <div
      className={cn(
        "relative rounded-full bg-muted flex items-center justify-center overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      {showFallback ? (
        <User className="text-muted-foreground" size={iconSizes[size]} />
      ) : (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  )
}
