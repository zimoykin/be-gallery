import { Controller, Logger, Post } from '@nestjs/common';
import { DbSeedingService } from './db-seeding.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAccess } from '@zimoykin/auth';

@ApiTags('db-seeding')
@ApiBearerAuth('Authorization')
@AdminAccess()
@Controller('db-seeding')
export class DbSeedingController {

    private readonly logger = new Logger(DbSeedingController.name);

    constructor(
        private readonly dbSeedingService: DbSeedingService
    ) { }

    @Post()
    async seeding() {
        this.logger.log('start seeding');
        await this.dbSeedingService.seeding();
        this.logger.log('finish seeding');
    }
}
