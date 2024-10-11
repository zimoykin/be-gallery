import { Injectable, Logger } from "@nestjs/common";
import { DynamoDbRepository, InjectRepository, IScanFilter } from "../../../libs/dynamo-db";
import { Like } from "./like.model";

@Injectable()
export class LikeRepository {
    private readonly logger = new Logger(LikeRepository.name);

    constructor(
        @InjectRepository(Like) private readonly likeModel: DynamoDbRepository<Like>,
    ) { }

    async find(filter: IScanFilter<Like>) {
        return this.likeModel.find(filter);
    }
    
    async count(filter: IScanFilter<Like>) {
        return this.likeModel.countByFilter(filter);
    }

    async create(data: Partial<Like>) {
        return this.likeModel
            .create({ ...data });
    }

    async remove(profileId: string, contentId: string) {
        const like = await this.likeModel
            .findOneByFilter({
                match: {
                    profileId: profileId,
                    contentId: contentId
                }
            });

        if (!like) {
            throw new Error('Like not found');
        }

        return this.likeModel
            .remove(like.id);

    }
}