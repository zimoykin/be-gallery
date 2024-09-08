import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { Folder } from './folder.model';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';
import { SCAN_FILTER_OPERATIONS } from 'src/dynamo-db/interfaces/scan-filter.interface';
import { FolderInputDto } from './dtos/folder-input.dto';

@Injectable()
export class FolderService {
    private readonly logger = new Logger(FolderService.name);

    constructor(
        @InjectRepository(Folder.name) private readonly folderRepository: DynamoDbRepository
    ) { }

    async findUserFolderById(id: string, userId: string) {
        return this.folderRepository.readByFilter({
            'match': { id, userId },
            limit: 1
        }).then(data => data[0])
            .catch(err => {
                this.logger.error(err);
                throw err;
            });
    }

    async findAllByUserId(userId: string) {
        return this.folderRepository.readByFilter({ match: { userId } });
    }
    async createFolder(data: Partial<Folder>) {
        return this.folderRepository.create(data);
    }

    async updateFolder(id: string, data: FolderInputDto, userId: string) {
        return this.folderRepository.update(id, { ...data, userId });
    }

    async removeFolder(id: string, userId: string) {
        const userFolder = await this.findUserFolderById(id, userId);
        if (!userFolder) {
            throw new Error(`Folder with id ${id} not found`);
        }
        return this.folderRepository.remove(id);
    }
}
