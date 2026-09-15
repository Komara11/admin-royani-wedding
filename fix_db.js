require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fixing URLs in Portfolio...");
  const portfolios = await prisma.portfolio.findMany();
  for (const p of portfolios) {
    if (p.imageUrl && p.imageUrl.includes('/uploads/')) {
      const newUrl = p.imageUrl.replace('/uploads/', '/api/media/');
      await prisma.portfolio.update({
        where: { id: p.id },
        data: { imageUrl: newUrl }
      });
      console.log(`Updated Portfolio ${p.id}: ${newUrl}`);
    }
  }

  console.log("Fixing URLs in SiteContent...");
  const contents = await prisma.siteContent.findMany();
  for (const c of contents) {
    let changed = false;
    let dataStr = JSON.stringify(c.data);
    if (dataStr.includes('/uploads/')) {
      dataStr = dataStr.replace(/\/uploads\//g, '/api/media/');
      changed = true;
    }
    if (changed) {
      await prisma.siteContent.update({
        where: { id: c.id },
        data: { data: JSON.parse(dataStr) }
      });
      console.log(`Updated SiteContent ${c.id}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
