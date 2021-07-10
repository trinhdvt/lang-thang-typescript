import {Get, HttpCode, JsonController, QueryParams} from "routing-controllers";
import {Service} from "typedi";
import PageRequest from "../dto/PageRequest";
import {StatusCodes} from "http-status-codes";
import PostService from "../service/PostService";

@Service()
@JsonController("/post")
export default class PostController {

    constructor(private postService: PostService) {
    }

    @Get()
    @HttpCode(StatusCodes.OK)
    async getPosts(@QueryParams() pageRequest: PageRequest) {
        const {prop, keyword} = pageRequest;

        if (prop) {
            return await this.postService.getPopularPost(prop, pageRequest.size);
        }

        return await this.postService.getPostByPublishDate(pageRequest);
    }

}