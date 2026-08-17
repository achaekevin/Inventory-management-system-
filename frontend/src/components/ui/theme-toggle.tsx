import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/contexts/ThemeContext"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle theme"
        >
          <motion.div
            initial={false}
            animate={{
              scale: resolvedTheme === 'dark' ? 0 : 1,
              opacity: resolvedTheme === 'dark' ? 0 : 1,
              rotate: resolvedTheme === 'dark' ? 90 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Sun className="h-5 w-5" />
          </motion.div>
          <motion.div
            initial={false}
            animate={{
              scale: resolvedTheme === 'dark' ? 1 : 0,
              opacity: resolvedTheme === 'dark' ? 1 : 0,
              rotate: resolvedTheme === 'dark' ? 0 : -90,
            }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
