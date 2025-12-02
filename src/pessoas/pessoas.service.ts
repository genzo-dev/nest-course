import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Not, Repository } from 'typeorm';
import { RecadosUtils } from 'src/recados/recados.utils';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly recadosUtils: RecadosUtils,
    private readonly hashingService: HashingService,
  ) {}

  notFoundPerson<T>(
    entity: T | null | undefined,
    errorMessage: string,
  ): asserts entity is T {
    if (!entity) {
      throw new NotFoundException(errorMessage);
    }
  }

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createPessoaDto.password,
      );

      const pessoaData = {
        nome: createPessoaDto.nome,
        passwordHash,
        email: createPessoaDto.email,
        routePolicies: createPessoaDto.routePolicies,
      };

      const novaPessoa = this.pessoaRepository.create(pessoaData);

      await this.pessoaRepository.save(novaPessoa);

      return novaPessoa;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail já está cadastrado');
      }

      throw error;
    }
  }

  async findAll() {
    const pessoas = await this.pessoaRepository.find({
      order: {
        id: 'DESC',
      },
    });

    return pessoas;
  }

  async findOne(id: number) {
    // console.log(this.recadosUtils.inverteString('Luiz'));

    const pessoa = await this.pessoaRepository.findOneBy({ id });

    if (!pessoa) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    return pessoa;
  }

  async update(
    id: number,
    updatePessoaDto: UpdatePessoaDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const pessoaData = {
      nome: updatePessoaDto.nome,
    };

    if (updatePessoaDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updatePessoaDto.password,
      );

      pessoaData['passwordHash'] = passwordHash;
    }

    const pessoa = await this.pessoaRepository.preload({
      id,
      ...pessoaData,
    });

    this.notFoundPerson(pessoa, 'Pessoa não encontrada');

    if (pessoa?.id !== tokenPayload.sub) {
      throw new ForbiddenException('Você não é essa pessoa');
    }

    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const pessoa = await this.findOne(id);

    if (pessoa?.id !== tokenPayload.sub) {
      throw new ForbiddenException('Você não é essa pessoa');
    }

    return this.pessoaRepository.remove(pessoa);
  }

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadRequestException('File too small');
    }

    // 🔴 PARA VÁRIOS ARQUIVOS:
    // const result: string[] = [];
    // files.forEach(async file => {
    //   const fileExtension = path
    //     .extname(file.originalname)
    //     .toLowerCase()
    //     .substring(1);
    //   const fileName = `${randomUUID()}.${fileExtension}`;
    //   const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);
    //   console.log(fileFullPath);

    //   result.push(fileFullPath);

    //   await fs.writeFile(fileFullPath, file.buffer);
    // });
    // return result;

    // 🔴 PARA UM ÚNICO ARQUIVO:
    const pessoa = await this.findOne(tokenPayload.sub);

    // if (!pessoa) {
    //   throw new NotFoundException('Pessoa não encontrada');
    // }

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);
    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);
    console.log(fileFullPath);

    // 🧑‍🎓❗ pesquisar e estudar sobre essas bibliotecas: file-type image-type sharp

    await fs.writeFile(fileFullPath, file.buffer);

    pessoa.picture = fileName;
    await this.pessoaRepository.save(pessoa);

    return pessoa;
  }
}
