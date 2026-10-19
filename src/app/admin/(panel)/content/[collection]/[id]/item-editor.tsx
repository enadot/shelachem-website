"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { deleteItemAction, saveItemAction } from "../../actions";
import type { CollectionSlug } from "@/lib/admin/collections";
import type { Values } from "@/lib/admin/fields";
import { useToast } from "@/components/admin/toast";

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
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (!confirm(`למחוק את ה${singular}? אי אפשר לבטל.`)) return;
              start(async () => {
                const res = await deleteItemAction(collection, id);
                if (res.ok) {
                  toast("נמחק");
                  router.push(`/admin/content/${collection}`);
                } else toast(res.error ?? "המחיקה נכשלה", "error");
              });
            }}
            className="min-h-11 cursor-pointer border-none bg-transparent px-3 text-[14.5px] font-bold text-danger"
          >
            {deleting ? "מוחק…" : "מחיקה"}
          </button>
        )
      }
    />
  );
}
