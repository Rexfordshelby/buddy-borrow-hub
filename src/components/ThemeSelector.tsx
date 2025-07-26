
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor },
  ];

  const colorSchemes = [
    { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-500' },
    { id: 'emerald', name: 'Emerald Green', color: 'bg-emerald-500' },
    { id: 'purple', name: 'Royal Purple', color: 'bg-purple-500' },
    { id: 'orange', name: 'Sunset Orange', color: 'bg-orange-500' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={theme === themeOption.id ? 'bg-accent' : ''}
            >
              <Icon className="mr-2 h-4 w-4" />
              {themeOption.name}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
        
        {colorSchemes.map((scheme) => (
          <DropdownMenuItem key={scheme.id}>
            <div className={`mr-2 h-4 w-4 rounded-full ${scheme.color}`} />
            {scheme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
