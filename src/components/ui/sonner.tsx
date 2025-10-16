import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

interface MyToasterProps {
  richColors?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  duration?: number;
}

const Toaster = ({ ...props }: MyToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
