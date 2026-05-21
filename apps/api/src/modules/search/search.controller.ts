import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Search")
@ApiBearerAuth()
@Controller("search")
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Global search across projects, generators, and chat history" })
  @ApiQuery({ name: "q", required: true, description: "Search query (min 2 chars)" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async search(
    @CurrentUser() user: AuthUser,
    @Query("q") query: string,
    @Query("limit") limit?: number
  ) {
    return this.searchService.search(user.userId, query || "", limit || 20);
  }
}
