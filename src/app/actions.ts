"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =======================
// PORTFOLIO ACTIONS
// =======================
export async function getPortfolios() {
  try {
    return await prisma.portfolio.findMany({ orderBy: { sortOrder: 'asc' } });
  } catch (err) {
    console.error("[getPortfolios] Error:", err);
    return [];
  }
}

export async function createPortfolio(data: any) {
  try {
    await prisma.portfolio.create({ data });
    revalidatePath('/dashboard/portfolio');
    return { success: true };
  } catch (err: any) {
    console.error("[createPortfolio] Error:", err);
    throw new Error(err.message || "Gagal membuat portfolio");
  }
}

export async function updatePortfolio(id: string, data: any) {
  try {
    await prisma.portfolio.update({ where: { id }, data });
    revalidatePath('/dashboard/portfolio');
    return { success: true };
  } catch (err: any) {
    console.error("[updatePortfolio] Error:", err);
    throw new Error(err.message || "Gagal memperbarui portfolio");
  }
}

export async function deletePortfolio(id: string) {
  try {
    await prisma.portfolio.delete({ where: { id } });
    revalidatePath('/dashboard/portfolio');
    return { success: true };
  } catch (err: any) {
    console.error("[deletePortfolio] Error:", err);
    throw new Error(err.message || "Gagal menghapus portfolio");
  }
}

export async function updatePortfolioOrder(items: any[]) {
  for (const item of items) {
    await prisma.portfolio.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder }
    });
  }
}

// =======================
// FAQ ACTIONS
// =======================
export async function getFaqs() {
  try {
    return await prisma.faqItem.findMany({ orderBy: { sortOrder: 'asc' } });
  } catch (err) {
    console.error("[getFaqs] Error:", err);
    return [];
  }
}

export async function createFaq(data: any) {
  try {
    await prisma.faqItem.create({ data });
    revalidatePath('/dashboard/faq');
    return { success: true };
  } catch (err: any) {
    console.error("[createFaq] Error:", err);
    throw new Error(err.message || "Gagal membuat FAQ");
  }
}

export async function updateFaq(id: string, data: any) {
  try {
    await prisma.faqItem.update({ where: { id }, data });
    revalidatePath('/dashboard/faq');
    return { success: true };
  } catch (err: any) {
    console.error("[updateFaq] Error:", err);
    throw new Error(err.message || "Gagal memperbarui FAQ");
  }
}

export async function deleteFaq(id: string) {
  try {
    await prisma.faqItem.delete({ where: { id } });
    revalidatePath('/dashboard/faq');
    return { success: true };
  } catch (err: any) {
    console.error("[deleteFaq] Error:", err);
    throw new Error(err.message || "Gagal menghapus FAQ");
  }
}

export async function updateFaqOrder(items: any[]) {
  for (const item of items) {
    await prisma.faqItem.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder }
    });
  }
}

// =======================
// PACKAGE ACTIONS
// =======================
export async function getPackages() {
  try {
    return await prisma.package.findMany({ orderBy: { sortOrder: 'asc' } });
  } catch (err) {
    console.error("[getPackages] Error:", err);
    return [];
  }
}

export async function createPackage(data: any) {
  try {
    await prisma.package.create({ data });
    revalidatePath('/dashboard/packages');
    return { success: true };
  } catch (err: any) {
    console.error("[createPackage] Error:", err);
    throw new Error(err.message || "Gagal membuat paket");
  }
}

export async function updatePackage(id: string, data: any) {
  try {
    await prisma.package.update({ where: { id }, data });
    revalidatePath('/dashboard/packages');
    return { success: true };
  } catch (err: any) {
    console.error("[updatePackage] Error:", err);
    throw new Error(err.message || "Gagal memperbarui paket");
  }
}

export async function deletePackage(id: string) {
  try {
    await prisma.package.delete({ where: { id } });
    revalidatePath('/dashboard/packages');
    return { success: true };
  } catch (err: any) {
    console.error("[deletePackage] Error:", err);
    throw new Error(err.message || "Gagal menghapus paket");
  }
}

export async function updatePackageOrder(items: any[]) {
  for (const item of items) {
    await prisma.package.update({
      where: { id: item.id },
      data: { sortOrder: item.sortOrder }
    });
  }
}

// =======================
// CONTENT ACTIONS
// =======================
export async function getContent(id: string) {
  try {
    const doc = await prisma.siteContent.findUnique({ where: { id } });
    return doc?.data || null;
  } catch (err) {
    console.error("[getContent] Error:", err);
    return null;
  }
}

export async function updateContent(id: string, data: any) {
  try {
    await prisma.siteContent.upsert({
      where: { id },
      update: { data },
      create: { id, data }
    });
    return { success: true };
  } catch (err: any) {
    console.error("[updateContent] Error:", err);
    throw new Error(err.message || "Gagal menyimpan konten");
  }
}


export async function getStats() {
  try {
    const [portfolio, packages, faqs] = await Promise.all([
      prisma.portfolio.count(),
      prisma.package.count(),
      prisma.faqItem.count()
    ]);
    return { portfolio, packages, faqs };
  } catch (err) {
    console.error("[getStats] Error:", err);
    return { portfolio: 0, packages: 0, faqs: 0 };
  }
}
