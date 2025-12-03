import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
// import { AuthTokenInterceptor } from 'src/common/interceptors/auth-token.interceptor';
import { ReqDataParam } from 'src/common/params/rec-data-param.decorator';
import { RecadosUtils } from './recados.utils';
// import {
//   MY_DINAMIC_CONFIG,
//   MyDinamicModule,
// } from 'src/my-dinamic/my-dinamic.module';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// import { RoutePolicyGuard } from 'src/auth/guards/role-policy.guard';
// import { ROUTE_POLICY_KEY } from 'src/auth/auth.constants';
// import { SetRoutePolicy } from 'src/auth/decorators/set-route-policy.decorator';
// import { RoutePolicies } from 'src/auth/enum/route-policies.enum';

// CRUD
// Create -> POST -> Criar um recado
// Read -> GET -> Ler todos os recados
// Read -> GET -> Ler apenas um recado
// Update -> PATCH / PUT -> Atualizar um recado
// Delete -> DELETE -> Apagar um recado

// PATCH é utilizado para atualizar dados de um recurso
// PUT é utilizado para atualizar um recurso inteiro

// @UseInterceptors(AuthTokenInterceptor)
// @UseGuards(RoutePolicyGuard)

@Controller('recados')
export class RecadosController {
  constructor(
    private readonly recadosService: RecadosService,
    // private readonly regexProtocol: RegexProtocol,
    private readonly recadosUtils: RecadosUtils,
  ) {}

  // @HttpCode(HttpStatus.OK)
  @Get()
  // @SetRoutePolicy(RoutePolicies.findAllRecados)
  @ApiQuery({
    name: 'offset',
    required: false,
    example: 1,
    description: 'Itens a pular',
  }) // Parâmetros da query
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Limite de itens por página',
  })
  @ApiResponse({ status: 200, description: 'Recados retornados com sucesso.' }) // Resposta bem-sucedida
  async findAll(
    @Query() paginationDto: PaginationDto,
    @ReqDataParam('method') method,
  ) {
    // console.log(method);
    const recados = await this.recadosService.findAll(paginationDto);
    return recados;
  }

  @ApiOperation({ summary: 'Obter um recado específico pelo ID' }) // Descrição da operação
  @ApiParam({ name: 'id', description: 'ID do recado', example: 1 }) // Parâmetro da rota
  @ApiResponse({ status: 200, description: 'Recado retornado com sucesso.' }) // Resposta bem-sucedida
  @ApiResponse({ status: 404, description: 'Recado não encontrado.' }) // Resposta de erro
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.recadosService.findOne(id);
  }

  // @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  // @SetRoutePolicy(RoutePolicies.createRecado)
  @UseGuards(AuthTokenGuard)
  @ApiBearerAuth()
  @Post()
  create(
    @Body() createRecadoDto: CreateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.create(createRecadoDto, tokenPayload);
  }

  // @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  // @SetRoutePolicy(RoutePolicies.updateRecado)
  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateRecadoDto: UpdateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.update(id, updateRecadoDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.remove(id, tokenPayload);
  }
}
