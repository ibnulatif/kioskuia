import { db } from "@/lib/db";

export async function notify(userId: string, title: string, body: string, href?: string) {
  await db.notification.create({ data: { userId, title, body, href } });
}

export async function audit(actorId: string | null, action: string, target?: string, meta?: object) {
  await db.auditLog.create({ data: { actorId, action, target, meta: meta ?? undefined } });
}
