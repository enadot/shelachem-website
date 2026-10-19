"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { deleteItemAction, saveItemAction } from "../../actions";
import type { CollectionSlug } from "@/lib/admin/collections";
import type { Values } from "@/lib/admin/fields";
import { useToast } from "@/components/admin/toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";

export function ItemEditor({
  collection,
  id,
  initial,
  singular,
}: {
  collection: CollectionSlug;
  id: string | null;
  initial: Values;
  singular: string;
}) {
  const [deleting, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  return (
    <EntityForm
      form={collection}
      initial={initial}
      action={(values) => saveItemAction(collection, id, values)}
      onSaved={() => router.refresh()}
      extraActions={
        id && (
          <ConfirmButton
            title={`למחוק את ה${singular}?`}
            description="הפריט יוסר מהאתר. עותק נשמר בגרסאות הקודמות."
            confirmLabel="מחיקה"
            destructive
            onConfirm={() =>
              start(async () => {
                const res = await deleteItemAction(collection, id);
                if (res.ok) {
                  toast("נמחק");
                  router.push(`/admin/content/${collection}`);
                } else toast(res.error ?? "המחיקה נכשלה", "error");
              })
            }
          >
            <Button
              type="button"
              variant="ghost"
              disabled={deleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 aria-hidden />
              {deleting ? "מוחק…" : "מחיקה"}
            </Button>
          </ConfirmButton>
        )
      }
    />
  );
}
