import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { GeneratorsController } from "./generators.controller";
import { GeneratorsService } from "./generators.service";

@Module({
  providers: [AiService, GeneratorsService],
  controllers: [AiController, GeneratorsController],
  exports: [AiService, GeneratorsService],
})
export class AiModule {}
