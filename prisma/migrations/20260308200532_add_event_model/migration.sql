-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "background_id" TEXT NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_background_id_fkey" FOREIGN KEY ("background_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
