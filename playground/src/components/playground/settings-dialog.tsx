'use client';

import {useState} from 'react';
import {Settings as SettingsIcon, Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {useSettings, type Accent} from '@/lib/settings';

const ACCENTS: Array<{value: Accent; label: string; swatch: string}> = [
  {value: 'blue', label: 'Blue', swatch: 'oklch(0.56 0.14 228)'},
  {value: 'teal', label: 'Teal', swatch: 'oklch(0.58 0.13 190)'},
  {value: 'violet', label: 'Violet', swatch: 'oklch(0.56 0.18 290)'},
  {value: 'amber', label: 'Amber', swatch: 'oklch(0.72 0.16 70)'}
];

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const {settings, setSetting, reset} = useSettings();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <SettingsIcon className="h-5 w-5" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Personalize how the playground feels — preferences persist on this
            device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Row
            id="reduce-motion"
            label="Reduce motion"
            description="Disable transitions and animations across the playground."
          >
            <Switch
              id="reduce-motion"
              checked={settings.reduceMotion}
              onCheckedChange={(v) => setSetting('reduceMotion', v)}
            />
          </Row>

          <Row
            id="announce-output"
            label="Announce output to screen readers"
            description="When on, the Explorer's formatted output is announced via aria-live as you tweak options."
          >
            <Switch
              id="announce-output"
              checked={settings.announceOutput}
              onCheckedChange={(v) => setSetting('announceOutput', v)}
            />
          </Row>

          <div className="space-y-2.5">
            <div>
              <Label className="text-sm">Accent color</Label>
              <p className="text-xs text-muted-foreground">
                Used for active states across the playground.
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="Accent color"
              className="flex flex-wrap gap-2"
            >
              {ACCENTS.map((a) => {
                const active = settings.accent === a.value;
                return (
                  <button
                    key={a.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={a.label}
                    onClick={() => setSetting('accent', a.value)}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? 'border-foreground/40 bg-foreground/5'
                        : 'border-border hover:bg-card/40'
                    }`}
                  >
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 rounded-full"
                      style={{background: a.swatch}}
                    />
                    {a.label}
                    {active && (
                      <Check className="h-3 w-3 text-foreground" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset to defaults
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  id,
  label,
  description,
  children
}: {
  id: string;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-1">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
