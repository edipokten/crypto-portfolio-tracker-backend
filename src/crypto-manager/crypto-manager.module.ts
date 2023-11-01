import { Module } from '@nestjs/common';
import { CryptoManagerService } from './crypto-manager.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CryptoManagerController } from './crypto-manager.controller';
import { HttpModule } from '@nestjs/axios';
import { ApiModule } from 'src/api/api.module';
@Module({
  providers: [CryptoManagerService],
  imports: [PrismaModule, HttpModule, ApiModule],
  controllers: [CryptoManagerController],
})
export class CryptoManagerModule {}
