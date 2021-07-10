import {Service} from "typedi";
import PostRepository from "../repository/PostRepository";
import PageRequest, {PopularType} from "../dto/PageRequest";
import {PostResponseDto} from "../dto/PostResponseDto";
import {HttpError} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import Post from "../models/Post";

@Service()
export default class PostService {

    constructor(private postRepo: PostRepository) {
    }

    public async getPostByPublishDate(pageRequest: PageRequest) {
        let pageOfPost = await this.postRepo.getPostByPublishDate(pageRequest);

        return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));
    }

    public async getPopularPost(property: PopularType, size: number) {
        let pageOfPost: Post[];

        switch (property) {
            case PopularType.BOOKMARK:
                pageOfPost = await this.postRepo.getPopularPostByBookmarkCount(size);

                return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));

            case PopularType.COMMENT:
                pageOfPost = await this.postRepo.getPopularPostByCommentCount(size);

                return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));

            default:
                throw new HttpError(StatusCodes.UNPROCESSABLE_ENTITY,
                    "Nonsupport popular type: " + property);
        }

    }

    public async searchPostByKeyword(keyword: string, pageRequest: PageRequest) {
        let pageOfPost = await this.postRepo.searchPostByKeyword(keyword, pageRequest);

        return pageOfPost.map(post => PostResponseDto.toPostResponseDto(post));
    }
}
