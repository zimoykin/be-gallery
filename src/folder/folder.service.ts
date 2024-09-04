import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from 'src/dynamo-db/decorators/inject-model.decorator';
import { Folder } from './folder.model';
import { DynamoDbRepository } from 'src/dynamo-db/dynamo-db.repository';

@Injectable()
export class FolderService {
    private readonly logger = new Logger(FolderService.name);

    constructor(
        @InjectRepository(Folder.name) private readonly folderRepository: DynamoDbRepository
    ) { }

    async findAll() {
        return this.folderRepository.read();
    }
    async create(data: any) {
        return this.folderRepository.create(data);
    }
}
