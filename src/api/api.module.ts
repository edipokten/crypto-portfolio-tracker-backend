import { Global, Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
