"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import CommandPalette, {
  useCommandPaletteShortcut,
} from "@/components/command-palette/CommandPalette";
import {
  useKeyboardShortcuts,
  useRegisterOverlayClose,
} from "@/components/keyboard/KeyboardShortcutsProvider";

const CommandPaletteTriggerContext = createContext<(() => void) | null>(null);

export function useCommandPaletteTrigger() {
  return useContext(CommandPaletteTriggerContext);
}

type CommandPaletteProviderProps = {
  children: ReactNode;
};

export default function CommandPaletteProvider({
  children,
}: CommandPaletteProviderProps) {
  const [open, setOpen] = useState(false);
  const { setCommandPaletteOpen } = useKeyboardShortcuts();

  const openPalette = useCallback(() => {
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
  }, []);

  useCommandPaletteShortcut(openPalette);
  useRegisterOverlayClose(closePalette);

  useEffect(() => {
    setCommandPaletteOpen(open);
  }, [open, setCommandPaletteOpen]);

  return (
    <CommandPaletteTriggerContext.Provider value={openPalette}>
      {children}
      <CommandPalette open={open} onClose={closePalette} />
    </CommandPaletteTriggerContext.Provider>
  );
}
