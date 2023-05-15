-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "alias" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "resetPasswordToken" TEXT,
    "emailVerificationToken" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
