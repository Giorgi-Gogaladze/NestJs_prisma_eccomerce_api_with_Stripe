import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool} from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
// აუცილებელია .env ფაილის ხელით ჩატვირთვა, რადგან Pool იქმნება კლასის გარეთ, 
// მანამ სანამ NestJS-ის ConfigModule გაეშვება.
const connectionString = process.env.DATABASE_URL;

if(!connectionString){
    throw new Error("DATABASE_URL environment variable is not set. Please check your .env file.");
}

// სტანდარტული Prisma-ს ნაცვლად, აქ ვიყენებთ 'pg' ბიბლიოთეკას (Pool), 
// რაც საშუალებას გვაძლევს უფრო ეფექტურად ვმართოთ კავშირების რაოდენობა (Connection Pooling).

const pool = new Pool({connectionString});
const adapter = new PrismaPg(pool);


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(){
        super({adapter});
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await pool.end();
    }
}