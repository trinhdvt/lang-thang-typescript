import {
    Authorized,
    Body,
    CurrentUser,
    Get,
    HttpCode,
    JsonController,
    Param,
    Post,
    QueryParams
} from "routing-controllers";
import {Service} from "typedi";
import PageRequest from "../dto/PageRequest";
import {StatusCodes} from "http-status-codes";
import PostService from "../service/PostService";
import IUserCredential from "../interfaces/IUserCredential";
import PostRequestDto from "../dto/PostRequestDto";

@Service()
@JsonController("/post")
export default class PostController {

    constructor(private postService: PostService) {
    }

    @Get()
    @HttpCode(StatusCodes.OK)
    async getPosts(@QueryParams() pageRequest: PageRequest) {
        const {prop, keyword} = pageRequest;

        if (keyword) {
            return await this.postService.searchPostByKeyword(keyword, pageRequest);
        }

        if (prop) {
            return await this.postService.getPopularPost(prop, pageRequest.size);
        }

        return await this.postService.getPostByPublishDate(pageRequest);
    }

    @Get("/:id")
    @HttpCode(StatusCodes.OK)
    async getPostById(
        @Param("id") id: number,
        @CurrentUser({required: false}) user: IUserCredential) {

        let loggedInId = user?.id;

        return await this.postService.getPostById(id, loggedInId);
    }

    @Authorized()
    @HttpCode(StatusCodes.OK)
    @Get("/:slug/edit")
    async getPostContentBySlug(@Param("slug") slug: string,
                               @CurrentUser() user: IUserCredential) {
        const userId = user.id;

        return await this.postService.getPostContentBySlug(slug, userId);
    }

    @Post()
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async publishNewPost(@Body() requestDto: PostRequestDto,
                         @CurrentUser() author: IUserCredential) {

        return await this.postService.addNewPostOrDraft(requestDto, author.id, true);
    }

    @Post("/draft")
    @Authorized()
    @HttpCode(StatusCodes.OK)
    async createNewDraft(@Body() requestDto: PostRequestDto,
                         @CurrentUser() author: IUserCredential) {

        return await this.postService.addNewPostOrDraft(requestDto, author.id, false);
    }
}