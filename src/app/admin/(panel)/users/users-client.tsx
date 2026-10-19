"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  MoreHorizontal,
  ShieldCheck,
  UserPlus,
  UserRoundX,
  UserRoundCheck,
} from "lucide-react";
import { createUserAction, resetPasswordAction, updateUserAction } from "./actions";
import { Field } from "@/components/admin/ui";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/admin/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/admin/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/admin/ui/alert-dialog";
import { buttonVariants } from "@/components/admin/ui/button";
import { useToast } from "@/components/admin/toast";

type Role = "admin" | "editor";
const ROLES = [
  { value: "editor", label: "עורך אתר" },
  { value: "admin", label: "מנהל" },
] as const;

/** הסיסמה הזמנית מוצגת פעם אחת — להעביר למשתמש בערוץ בטוח. */
function TempPassword({ name, password }: { name: string; password: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Alert className="border-amber-300 bg-amber-50">
      <KeyRound aria-hidden />
      <AlertTitle className="font-bold">סיסמה זמנית ל{name}</AlertTitle>
      <AlertDescription className="text-amber-950">
        <div className="mt-1 flex items-center gap-2">
          <code dir="ltr" className="tnum select-all rounded-md border bg-white px-2.5 py-1 text-[15px] font-bold">
            {password}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="העתקה"
            onClick={() => {
              void navigator.clipboard?.writeText(password);
              setCopied(true);
            }}
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          </Button>
        </div>
        <p className="m-0 mt-2 text-[13px]">
          מוצגת רק עכשיו. שלחו אותה למשתמש — בכניסה הראשונה הוא יתבקש לבחור סיסמה משלו.
        </p>
      </AlertDescription>
    </Alert>
  );
}

export function CreateUserDialog() {
  const empty = { name: "", email: "", role: "editor" as Role };
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(empty);
  const [error, setError] = useState<string>();
  const [created, setCreated] = useState<{ name: string; password: string }>();
  const [pending, start] = useTransition();
  const reset = () => {
    setV(empty);
    setError(undefined);
    setCreated(undefined);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus aria-hidden />
          משתמש חדש
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sm:text-start">
          <DialogTitle>{created ? "המשתמש נוצר" : "משתמש חדש"}</DialogTitle>
          <DialogDescription>
            {created ? "העבירו לו את הסיסמה הזמנית." : "המשתמש יקבל סיסמה זמנית ויחליף אותה בכניסה הראשונה."}
          </DialogDescription>
        </DialogHeader>
        {created ? (
          <>
            <TempPassword {...created} />
            <DialogFooter className="sm:justify-start">
              <Button onClick={() => setOpen(false)}>סגירה</Button>
            </DialogFooter>
          </>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await createUserAction(v);
                if (res.ok && res.password) setCreated({ name: v.name, password: res.password });
                else setError(res.error);
              });
            }}
          >
            <Field label="שם" htmlFor="nu-name">
              <Input
                id="nu-name"
                value={v.name}
                onChange={(e) => setV({ ...v, name: e.target.value })}
                required
                className="h-10"
              />
            </Field>
            <Field label="דוא״ל" htmlFor="nu-email">
              <Input
                id="nu-email"
                type="email"
                dir="ltr"
                value={v.email}
                onChange={(e) => setV({ ...v, email: e.target.value })}
                required
                className="h-10"
              />
            </Field>
            <Field label="הרשאה" htmlFor="nu-role" hint="מנהל רואה גם את מסך המשתמשים.">
              <Select value={v.role} onValueChange={(role) => setV({ ...v, role: role as Role })}>
                <SelectTrigger id="nu-role" className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter className="gap-2 sm:justify-start">
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="animate-spin" aria-hidden />}
                {pending ? "יוצר…" : "יצירת משתמש"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                ביטול
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

type Pending = { kind: "reset" } | { kind: "active"; active: boolean } | null;

export function UserRowActions({
  id,
  name,
  role,
  active,
  self,
}: {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  self: boolean;
}) {
  const [busy, start] = useTransition();
  const [confirming, setConfirming] = useState<Pending>(null);
  const [password, setPassword] = useState<string>();
  const toast = useToast();
  const run = (fn: () => Promise<{ ok: boolean; error?: string; password?: string }>, done: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast(res.error ?? "הפעולה נכשלה", "error");
      if (res.password) setPassword(res.password);
      toast(done);
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`פעולות — ${name}`} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : <MoreHorizontal aria-hidden />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden />
            הרשאה
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={role}
            onValueChange={(r) => r !== role && run(() => updateUserAction({ id, role: r as Role }), "ההרשאה עודכנה")}
          >
            {ROLES.map((r) => (
              <DropdownMenuRadioItem key={r.value} value={r.value} disabled={self}>
                {r.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirming({ kind: "reset" })}>
            <KeyRound aria-hidden />
            איפוס סיסמה
          </DropdownMenuItem>
          {!self && (
            <DropdownMenuItem
              variant={active ? "destructive" : "default"}
              onSelect={() => setConfirming({ kind: "active", active: !active })}
            >
              {active ? <UserRoundX aria-hidden /> : <UserRoundCheck aria-hidden />}
              {active ? "השבתה" : "הפעלה מחדש"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming !== null} onOpenChange={(o) => !o && setConfirming(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="sm:text-start">
            <AlertDialogTitle>
              {confirming?.kind === "reset"
                ? `לאפס את הסיסמה של ${name}?`
                : confirming?.kind === "active" && confirming.active
                  ? `להפעיל מחדש את ${name}?`
                  : `להשבית את ${name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.kind === "reset"
                ? "תיווצר סיסמה זמנית חדשה, והמשתמש ינותק מכל המכשירים."
                : confirming?.kind === "active" && confirming.active
                  ? "המשתמש יוכל להתחבר שוב עם הסיסמה שלו."
                  : "המשתמש ינותק מיד ולא יוכל להתחבר עד שיופעל מחדש."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogAction
              className={
                confirming?.kind === "active" && !confirming.active
                  ? buttonVariants({ variant: "destructive" })
                  : undefined
              }
              onClick={() => {
                const c = confirming;
                setConfirming(null);
                if (c?.kind === "reset") run(() => resetPasswordAction(id), "נוצרה סיסמה זמנית");
                else if (c?.kind === "active")
                  run(() => updateUserAction({ id, active: c.active }), c.active ? "המשתמש הופעל" : "המשתמש הושבת");
              }}
            >
              {confirming?.kind === "reset"
                ? "איפוס"
                : confirming?.kind === "active" && confirming.active
                  ? "הפעלה"
                  : "השבתה"}
            </AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(password)} onOpenChange={(o) => !o && setPassword(undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="sm:text-start">
            <DialogTitle>הסיסמה אופסה</DialogTitle>
            <DialogDescription>העבירו ל{name} את הסיסמה הזמנית.</DialogDescription>
          </DialogHeader>
          {password && <TempPassword name={name} password={password} />}
          <DialogFooter className="sm:justify-start">
            <Button onClick={() => setPassword(undefined)}>סגירה</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
