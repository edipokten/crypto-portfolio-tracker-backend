import { Module } from '@nestjs/common';
import { CryptoManagerModule } from './crypto-manager/crypto-manager.module';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CryptoManagerModule,
    PrismaModule,
    ApiModule,
  ],
})
export class AppModule {}
