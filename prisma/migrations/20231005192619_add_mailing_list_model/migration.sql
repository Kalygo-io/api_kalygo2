-- CreateTable
CREATE TABLE "MailingList" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "MailingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailingList_email_key" ON "MailingList"("email");
