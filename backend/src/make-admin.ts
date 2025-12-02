import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }

    console.log('Current user:', { email: user.email, role: user.role });

    if (user.role === 'admin') {
      console.log('User is already an admin!');
    } else {
      const updated = await prisma.user.update({
        where: { email },
        data: { role: 'admin' },
      });
      console.log('User updated to admin!', {
        email: updated.email,
        role: updated.role,
      });
    }
  } catch (error: unknown) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: ts-node make-admin.ts <email>');
  console.log('Example: ts-node make-admin.ts user@example.com');
  process.exit(1);
}

makeAdmin(email);
