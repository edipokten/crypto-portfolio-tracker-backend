import { Controller, Post, Get, Put, Body, Delete } from '@nestjs/common';
import { CryptoManagerService } from './crypto-manager.service';
import { CreateCryptoDto, UpdateCryptoDto } from './dto';
import { CryptoID } from './decorator';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('crypto')
export class CryptoManagerController {
  constructor(private cryptoManagerService: CryptoManagerService) {}

  // Endpoint for creating a new cryptocurrency record.
  @ApiBody({
    type: CreateCryptoDto,
    description: 'Endpoint for creating a new cryptocurrency record',
  })
  @ApiTags('CRUD Endpoints')
  @Post()
  create(@Body() dto: CreateCryptoDto): Promise<any> {
    return this.cryptoManagerService.create(dto);
  }

  // Endpoint for retrieving the standard deviation of all cryptocurrency records.
  @ApiOperation({
    description:
      'Endpoint for retrieving the standard deviation of all cryptocurrency records.',
  })
  @ApiTags('Standard Deviation Endpoints')
  @Get('/std')
  getStd() {
    return this.cryptoManagerService.getAllStandardDeviationCalculation();
  }

  // Endpoint for retrieving the latest standard deviation calculation.
  @ApiOperation({
    description:
      'Endpoint for retrieving the latest standard deviation calculation.',
  })
  @ApiTags('Standard Deviation Endpoints')
  @Get('std/new')
  findStdNew() {
    return this.cryptoManagerService.getNewStandardDeviationCalculation();
  }

  // Endpoint to retrieve a single cryptocurrency record based on its ID.
  @ApiOperation({
    description:
      'Endpoint to retrieve a single cryptocurrency record based on its ID.',
  })
  @ApiTags('CRUD Endpoints')
  @Get('/:id')
  findOne(@CryptoID('id') id: number): Promise<unknown> {
    return this.cryptoManagerService.findOne(id);
  }

  // Endpoint to retrieve all cryptocurrency records.
  @ApiOperation({
    description: 'Endpoint to retrieve all cryptocurrency records.',
  })
  @ApiTags('CRUD Endpoints')
  @Get()
  findAll(): Promise<any> {
    return this.cryptoManagerService.findAll();
  }

  // Endpoint to update a cryptocurrency record based on its ID.
  @ApiOperation({
    description: 'Endpoint to update a cryptocurrency record based on its ID',
  })
  @ApiBody({
    type: UpdateCryptoDto,
    description:
      " Operation type for the PUT operation can be one of the following: 'update', 'subtraction', or 'addition'.",
  })
  @ApiTags('CRUD Endpoints')
  @Put('/:id')
  update(
    @CryptoID('id') id: number,
    @Body() dto: UpdateCryptoDto,
  ): Promise<any> {
    return this.cryptoManagerService.update(id, dto);
  }

  // Endpoint to delete a cryptocurrency record based on its ID.
  @ApiOperation({
    description: ' Endpoint to delete a cryptocurrency record based on its ID.',
  })
  @ApiTags('CRUD Endpoints')
  @Delete(':id')
  remove(@CryptoID('id') id: number): Promise<unknown> {
    return this.cryptoManagerService.remove(id);
  }
}
