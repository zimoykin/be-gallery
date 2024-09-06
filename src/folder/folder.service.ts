import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { Folder } from './folder.model';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { SCAN_FILTER_OPERATIONS } from 'src/dynamo-db/interfaces/scan-filter.interface';

@Injectable()
export class FolderService {
    private readonly logger = new Logger(FolderService.name);

    constructor(
        @InjectRepository(Folder.name) private readonly folderRepository: DynamoDbRepository
    ) { }

    async findUserFolderById(id: string, userId: string) {
        return this.folderRepository.readByFilter({
            'match': { id, userId }
        });
    }

    async findAllByUserId(userId: string) {
        return this.folderRepository.readByFilter({ match: { userId } });
    }
    async createFolder(data: Partial<Folder>) {
        return this.folderRepository.create(data);
    }
}
