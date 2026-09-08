"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =======================
// PORTFOLIO ACTIONS
// =======================
export async function getPortfolios() {
  return await prisma.portfolio.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createPortfolio(data: any) {
  await prisma.portfolio.create({ data });
  revalidatePath('/dashboard/portfolio');
}

export async function updatePortfolio(id: string, data: any) {
  await prisma.portfolio.update({ where: { id }, data });
  revalidatePath('/dashboard/portfolio');
}

export async function deletePortfolio(id: string) {
  await prisma.portfolio.delete({ where: { id } });
  revalidatePath('/dashboard/portfolio');
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
  return await prisma.faqItem.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createFaq(data: any) {
  await prisma.faqItem.create({ data });
  revalidatePath('/dashboard/faq');
}

export async function updateFaq(id: string, data: any) {
  await prisma.faqItem.update({ where: { id }, data });
  revalidatePath('/dashboard/faq');
}

export async function deleteFaq(id: string) {
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath('/dashboard/faq');
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
  return await prisma.package.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createPackage(data: any) {
  await prisma.package.create({ data });
  revalidatePath('/dashboard/packages');
}

export async function updatePackage(id: string, data: any) {
  await prisma.package.update({ where: { id }, data });
  revalidatePath('/dashboard/packages');
}

export async function deletePackage(id: string) {
  await prisma.package.delete({ where: { id } });
  revalidatePath('/dashboard/packages');
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
  const doc = await prisma.siteContent.findUnique({ where: { id } });
  return doc?.data || null;
}

export async function updateContent(id: string, data: any) {
  await prisma.siteContent.upsert({
    where: { id },
    update: { data },
    create: { id, data }
  });
}


export async function getStats() {
  const [portfolio, packages, faqs] = await Promise.all([
    prisma.portfolio.count(),
    prisma.package.count(),
    prisma.faqItem.count()
  ]);
  return { portfolio, packages, faqs };
}
