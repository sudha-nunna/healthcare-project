import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const STORAGE_KEY = "adminKey";

export function getAdminKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function AdminKeyGate({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getAdminKey();
    if (existing) {
      setKey(existing);
      setSaved(true);
    }
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, key.trim());
    setSaved(Boolean(key.trim()));
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    setKey("");
    setSaved(false);
  }

  // If backend doesn't require ADMIN_KEY, user can leave this blank and continue.
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2 flex-1">
            <Label htmlFor="adminKey">Admin Key (optional)</Label>
            <Input
              id="adminKey"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Set to enable admin-only actions"
            />
            <p className="text-xs text-muted-foreground">
              If your backend has <code className="font-mono">ADMIN_KEY</code> set, enter the same value here to add dentists / update status.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={clear} disabled={!saved && !key}>
              Clear
            </Button>
            <Button type="button" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </Card>

      {children}
    </div>
  );
}

