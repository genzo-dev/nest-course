import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
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
      const pessoaData = {
        nome: createPessoaDto.nome,
        passwordHash: createPessoaDto.password,
        email: createPessoaDto.email,
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
    const pessoa = await this.pessoaRepository.findOneBy({
      id,
    });

    return pessoa;
  }

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    const pessoaData = {
      nome: updatePessoaDto.nome,
      passwordHash: updatePessoaDto.password,
    };

    const pessoa = await this.pessoaRepository.preload({
      id,
      ...pessoaData,
    });

    this.notFoundPerson(pessoa, 'Pessoa não encontrada');

    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: number) {
    const pessoa = await this.pessoaRepository.findOneBy({
      id,
    });

    // if (!pessoa) {
    //   throw new NotFoundException('Pessoa não encontrada');
    // }

    this.notFoundPerson(pessoa, 'Pessoa não encontrada');

    return this.pessoaRepository.remove(pessoa);
  }
}
