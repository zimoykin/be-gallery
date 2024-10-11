
// @Injectable()
// export class PhotoSeedingService {
//     private readonly logger = new Logger(PhotoSeedingService.name);
//     constructor(
//         // @ts-ignore
//         @InjectRepository('Photo')
//         private readonly photoRepository: DynamoDbRepository<Photo>,
//         private readonly folderService: FolderService,
//         private readonly photoService: PhotoService,
//         // @ts-ignore //
//         @InjectS3Bucket('photos')
//         private readonly s3BucketServiceOriginal: S3BucketService,
//         // @ts-ignore //
//         @InjectS3Bucket('preview')
//         private readonly s3BucketServicePreview: S3BucketService,
//         // @ts-ignore //
//         @InjectS3Bucket('compressed')
//         private readonly s3BucketServiceCompressed: S3BucketService,
//         private readonly imageCompressorService: ImageCompressorService,
//     ) { }
//     /**
//      * Seeds the photos table with sample data.
//      * @returns {Promise<void>}
//      */
//     async seed(): Promise<void> {
//         this.logger.log('Seeding photos');
//         for await (const { id: profileId } of profiles) {
//             this.logger.log(`Profile: ${profileId}`);
//             const folders = await this.folderService.findAllByProfileId(profileId);
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//             for await (const { id: folderId } of folders) {
//                 for await (const [index, photo] of Object.entries(seedPhotos(folderId, profileId))) {
//                     const imageBuffer = await this.imageCompressorService.getImageBufferFromUrl(photo.url);
//                     const originalname = photo.url.split('/').find((x) => x.includes('.jpg')) ?? `${profileId}-${folderId}-${index}.jpg`;
//                     const formData = {
//                         buffer: imageBuffer,
//                         originalname: originalname,
//                         filename: originalname.replace('.jpg', ''),
//                         mimetype: 'jpeg'
//                     } as Express.Multer.File;

//                     await this.photoService.createPhotoObject(folderId, profileId, photo, formData);
//                     await new Promise((resolve) => setTimeout(resolve, 4000));
//                 }
//                 await new Promise((resolve) => setTimeout(resolve, 3000));
//             }
//         }

//     }
// }