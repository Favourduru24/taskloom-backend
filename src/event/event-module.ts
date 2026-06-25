import { Module } from "@nestjs/common";
import { EventGateway } from "./event.gateway";
import { AuthModule } from "src/auth/auth.module";
import { WorkspaceModule } from "src/workspace/workspace.module";

@Module({
  imports: [AuthModule, WorkspaceModule],
    providers: [EventGateway],
    exports: [EventGateway],
  })
  export class EventModule {}