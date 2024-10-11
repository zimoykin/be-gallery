import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DynamoDbRepository, InjectRepository, IScanFilter } from "../../../libs/dynamo-db";
import { Folder } from "./folder.model";

@Injectable()
export class FolderRepository {
    private readonly logger = new Logger(FolderRepository.name);

    constructor(
        @InjectRepository(Folder)
        private readonly folderModel: DynamoDbRepository<Folder>
    ) { }


    async find(filter: IScanFilter<Folder>) {
        const data = await this.folderModel.find(filter);
        return data ?? [];
    }

    async findOne(filter: IScanFilter<Folder>) {
        const data = await this.folderModel.findOneByFilter(filter);
        if (!data) {
            throw new NotFoundException();
        }
        return data;
    }

    async create(data: Partial<Folder>) {
        const createdId = await this.folderModel.create(data);
        return createdId;
    }

    async update(id: string, data: Partial<Folder>) {
        return this.folderModel.update(id, data);
    }

    async remove(id: string) {
        return this.folderModel.remove(id);
    }

}