import { db } from "@/lib/db";
import { PLANS } from "@/lib/utils";
import { notify } from "@/lib/notify";

export async function activatePromotion(transactionId: string) {
  const trx = await db.transaction.findUnique({ where: { id: transactionId }, include: { listing: true } });
  if (!trx || trx.status === "PAID") return;
  const days = PLANS[trx.plan].days;
  const startsAt = new Date();
  const endsAt = new Date(Date.now() + days * 86400000);
  await db.$transaction([
    db.transaction.update({ where: { id: trx.id }, data: { status: "PAID", paidAt: startsAt } }),
    db.promotion.create({ data: { listingId: trx.listingId, transactionId: trx.id, plan: trx.plan, startsAt, endsAt } }),
    db.listing.update({
      where: { id: trx.listingId },
      data: { plan: trx.plan, planUntil: endsAt, featured: trx.plan === "PRO" },
    }),
  ]);
  await notify(trx.userId, "Promosi berhasil", `Paket ${trx.plan} aktif untuk "${trx.listing.title}".`, "/dashboard/promotions");
}
