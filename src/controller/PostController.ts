import {CurrentUser, Get, HttpCode, JsonController, Param, QueryParams} from "routing-controllers";
import {Service} from "typedi";
import PageRequest from "../dto/PageRequest";
import {StatusCodes} from "http-status-codes";
import PostService from "../service/PostService";
import IUserCredential from "../interfaces/IUserCredential";

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
}