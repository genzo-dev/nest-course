import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { EmailService } from 'src/email/email.service';
import { RecadosEntity } from './entities/recados.entity';
import { ResponseRecadoDto } from './dto/response-recado.dto';

// Scope.DEFAULT -> O provider em questão é um singleton
// Scope.REQUEST -> O provider é instanciado a cada requisição
// Scope.TRANSIENT -> É criada uma instância do provider para cada classe que injetar este provider

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(RecadosEntity)
    private readonly recadoRepository: Repository<RecadosEntity>,
    private readonly pessoasService: PessoasService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    // const databaseUsername =
    //   this.configService.get<string>('DATABASE_USERNAME');
    // console.log({ databaseUsername });
    // console.log('process.env', process.env.DATABASE_USERNAME);
  }

  async findAll(paginationDto?: PaginationDto): Promise<ResponseRecadoDto[]> {
    const { limit = 10, offset = 0 } = paginationDto ?? {};

    const recados = await this.recadoRepository.find({
      take: limit, // quantos registros serão exibidos (por página)
      skip: offset, // quantos regisros devem ser pulados
      relations: ['de', 'para'],
      order: {
        id: 'DESC',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });
    return recados;
  }

  async findOne(id: number): Promise<ResponseRecadoDto> {
    const recado = await this.recadoRepository.findOne({
      where: {
        id,
      },
      relations: ['de', 'para'],
      order: {
        id: 'DESC',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });

    if (recado) return recado;

    // throw new HttpException('Recado não encontrado', HttpStatus.NOT_FOUND);
    throw new NotFoundException('Recado não encontrado');
  }

  async create(
    createRecadoDto: CreateRecadoDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<ResponseRecadoDto> {
    const { paraId } = createRecadoDto;

    const de = await this.pessoasService.findOne(tokenPayload.sub);

    const para = await this.pessoasService.findOne(paraId);

    this.pessoasService.notFoundPerson(de, 'Remetente não encontrado');
    this.pessoasService.notFoundPerson(para, 'Destinatário não encontrado');

    const novoRecado = {
      texto: createRecadoDto.texto,
      de,
      para,
      lido: false,
      data: new Date(),
    };

    const recado = this.recadoRepository.create(novoRecado);
    await this.recadoRepository.save(recado);

    await this.emailService.sendEmail(
      para.email,
      `Você recebeu um recado de ${de.nome} - ${de.email}`,
      createRecadoDto.texto,
    );

    return {
      ...recado,
      de: { id: recado.de.id, nome: recado.de.nome },
      para: { id: recado.para.id, nome: recado.para.nome },
    };
  }

  async update(
    id: number,
    updateRecadoDto: UpdateRecadoDto,
    tokenPayload: TokenPayloadDto,
  ): Promise<ResponseRecadoDto> {
    const recado = await this.findOne(id);

    if (recado.de.id !== tokenPayload.sub) {
      throw new ForbiddenException('Esse recado não é seu');
    }

    recado.texto = updateRecadoDto?.texto ?? recado.texto;
    recado.lido = updateRecadoDto?.lido ?? recado.lido;

    return await this.recadoRepository.save(recado);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const recado = await this.findOne(id);

    if (recado.de.id !== tokenPayload.sub) {
      throw new ForbiddenException('Esse recado não é seu');
    }

    await this.recadoRepository.delete(recado.id);
    return recado;
  }
}
