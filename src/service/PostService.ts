import {Service} from "typedi";
import PostRepository from "../repository/PostRepository";
import PageRequest, {PopularType} from "../dto/PageRequest";
import {PostResponseDto} from "../dto/PostResponseDto";
import {HttpError, NotFoundError, UnauthorizedError} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import Post from "../models/Post";
import {AccountDto} from "../dto/AccountDto";

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

    public async getPostById(id: number, loggedInId: number | undefined) {
        const post = await this.postRepo.findPostById(id);
        if (!post) {
            throw new NotFoundError("Not found");
        }

        const author = post.author;

        const authorDto = AccountDto.toBasicAccount(author);
        authorDto.postCount = author.posts.length;
        authorDto.followCount = author.followingMe.length;

        const postDto = PostResponseDto.toPostResponseDto(post);
        postDto.author = authorDto;
        postDto.isOwner = authorDto.accountId == loggedInId;
        for (const acc of post.bookmarkedAccount) {
            if (acc.id == loggedInId)
                postDto.isBookmarked = true;
        }

        return postDto;
    }

    public async getPostContentBySlug(slug: string, userId: number) {
        const post = await this.postRepo.getPostBySlug(slug);
        if (!post) {
            throw new NotFoundError("Not found");
        }

        if (post.author.id != userId) {
            throw new UnauthorizedError("Not authorized");
        }

        return PostResponseDto.toPostResponseDto(post);
    }
}

