import { Controller } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { handle } from 'src/common/utils/handle';
import { LoggerService } from 'src/logger/logger.service';

@Controller('dashboard')
@Auth()
export class DashboardController {

    constructor(private readonly logger: LoggerService) {}
    @ResponseMessage('Workspace tasks stats fetched successfully.')
    async getWorkspaceTaskStats () {
    //    return handle(
    //     this.logger,
    //     () => {},
    //     ''
    //    )
    }
}
