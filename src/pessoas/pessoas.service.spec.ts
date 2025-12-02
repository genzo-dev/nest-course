import { Repository } from 'typeorm';
import { PessoasService } from './pessoas.service';
import { Pessoa } from './entities/pessoa.entity';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecadosUtils } from 'src/recados/recados.utils';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';

jest.mock('fs/promises');

describe('PessoasService', () => {
  let pessoasService: PessoasService;
  let pessoasRepository: Repository<Pessoa>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: RecadosUtils,
          useValue: {},
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    pessoasService = module.get<PessoasService>(PessoasService);
    pessoasRepository = module.get<Repository<Pessoa>>(
      getRepositoryToken(Pessoa),
    );
    hashingService = module.get<HashingService>(HashingService);
  });

  // Caso - teste
  // Configurar - Arrange
  // Fazer alguma ação - Act
  // Conferir se essa ação teve o resultado esperado - Assert
  it('pessoaService deve estar definido', () => {
    expect(pessoasService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new person', async () => {
      // Arrange
      // createPessoaDto
      const createPessoaDto: CreatePessoaDto = {
        email: 'enzo@email.com',
        nome: 'Enzo',
        password: '123456',
        routePolicies: [RoutePolicies.createPessoa],
      };
      const passwordHash = 'hashedPassword';
      const novaPessoa = {
        id: 1,
        nome: createPessoaDto.nome,
        email: createPessoaDto.email,
        routePolicies: createPessoaDto.routePolicies,
        passwordHash,
      };
      // Que o hashingService tenha o método hash
      // Saber se o hashingService foi chamado com createPessoaDto.password
      // Saber se o pessoasRepository.create foi chamado com os dados pessoa
      // Saber se o pessoasRepository.save foi criado com a nova pessoa
      // O retorno final deve ser a nova pessoa criada -> expect

      // Como o valor retornado por hashingService.hash é necessário, vamos simular esse valor:
      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      // Como a pessoa retornada por pessoasRepository.create é necessária em pessoaRepository.save,
      // vamos simular esse valor:
      jest
        .spyOn(pessoasRepository, 'create')
        .mockReturnValue(novaPessoa as any);

      // Act
      const result = await pessoasService.create(createPessoaDto);

      // Assert
      // O método hashingService.hash deve ser chamado com createPessoaDto.password
      expect(hashingService.hash).toHaveBeenCalledWith(
        createPessoaDto.password,
      );
      // O método pessoaReposiroty.create deve ser chamado com os dados da
      // novaPessoa com o hash de senha gerado por hashingService.hash
      expect(pessoasRepository.create).toHaveBeenCalledWith({
        nome: createPessoaDto.nome,
        passwordHash: passwordHash,
        email: createPessoaDto.email,
        routePolicies: createPessoaDto.routePolicies,
      });
      // O método pessoaRepository.save deve ser chamado com a
      // novaPessoa gerada por pessoaRepository.create
      expect(pessoasRepository.save).toHaveBeenCalledWith(novaPessoa);
      // O resultado final do método pessoasService.create deve ser a novaPessoa
      expect(result).toEqual(novaPessoa);
    });

    it('should throw ConflictException when email already exists', async () => {
      jest
        .spyOn(pessoasRepository, 'save')
        .mockRejectedValue({ code: '23505' });

      await expect(pessoasService.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw any Errors', async () => {
      jest
        .spyOn(pessoasRepository, 'save')
        .mockRejectedValue(new Error('generic error'));

      await expect(pessoasService.create({} as any)).rejects.toThrow(
        new Error('generic error'),
      );
    });
  });

  describe('findOne', () => {
    it('should find a person by id', async () => {
      const pessoaId = 1;
      const pessoaFound = {
        id: pessoaId,
        nome: 'Enzo',
        email: 'enzo@email.com',
        routePolicies: [],
        passwordHash: 'hashedPassword',
      };

      jest
        .spyOn(pessoasRepository, 'findOneBy')
        .mockResolvedValue(pessoaFound as any);

      const result = await pessoasService.findOne(pessoaId);

      expect(result).toEqual(pessoaFound);
    });

    it('should find a person by id', async () => {
      await expect(pessoasService.findOne(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should find all persons', async () => {
      const pessoasMock: Pessoa[] = [
        {
          id: 1,
          nome: 'Enzo',
          email: 'enzo@email.com',
          routePolicies: [RoutePolicies.findAllPessoas],
          passwordHash: 'hashedPassword',
        } as Pessoa,
        {
          id: 2,
          nome: 'Ravi',
          email: 'ravi@email.com',
          routePolicies: [RoutePolicies.findAllPessoas],
          passwordHash: 'hashedPassword',
        } as Pessoa,
      ];

      jest.spyOn(pessoasRepository, 'find').mockResolvedValue(pessoasMock);

      const result = await pessoasService.findAll();

      expect(result).toEqual(pessoasMock);
      expect(pessoasRepository.find).toHaveBeenCalledWith({
        order: {
          id: 'DESC',
        },
      });
    });
  });

  describe('update', () => {
    it('should update the person when authorized', async () => {
      const pessoaId = 1;
      const updatePessoaDto = {
        nome: 'genzodev',
        password: '654321',
      };
      const tokenPayload = { sub: pessoaId } as any;
      const passwordHash = 'newHashedPassword';
      const updatedPessoa = {
        id: pessoaId,
        nome: 'genzodev',
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(pessoasRepository, 'preload')
        .mockResolvedValue(updatedPessoa as any);
      jest
        .spyOn(pessoasRepository, 'save')
        .mockResolvedValue(updatedPessoa as any);

      const result = await pessoasService.update(
        pessoaId,
        updatePessoaDto,
        tokenPayload,
      );

      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePessoaDto.password,
      );
      expect(pessoasRepository.preload).toHaveBeenCalledWith({
        id: pessoaId,
        nome: updatePessoaDto.nome,
        passwordHash,
      });
      expect(pessoasRepository.save).toHaveBeenCalledWith(updatedPessoa);
      expect(result).toEqual(updatedPessoa);
    });

    it('should throw ForbiddenException when not authorized', async () => {
      const pessoaId = 1;
      const tokenPayload = { sub: 2 } as any;
      const updatePessoaDto = { nome: 'devgenzo' };

      jest.spyOn(pessoasRepository, 'preload').mockResolvedValue({
        id: pessoaId,
        nome: 'genzodev',
      } as any);

      await expect(
        pessoasService.update(pessoaId, updatePessoaDto, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when person does not exist', async () => {
      const pessoaId = 1;
      const tokenPayload = { sub: pessoaId } as any;
      const updatePessoaDto = {
        nome: 'devgenzo',
      };

      jest.spyOn(pessoasRepository, 'preload').mockResolvedValue(undefined);

      await expect(
        pessoasService.update(pessoaId, updatePessoaDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the person when authorized', async () => {
      const pessoaId = 1;
      const tokenPayload = { sub: pessoaId } as any;
      const existingPessoa = { id: pessoaId, nome: 'genzodev' };

      jest
        .spyOn(pessoasService, 'findOne')
        .mockResolvedValue(existingPessoa as any);
      jest
        .spyOn(pessoasRepository, 'remove')
        .mockResolvedValue(existingPessoa as any);

      const result = await pessoasService.remove(pessoaId, tokenPayload);

      expect(pessoasService.findOne).toHaveBeenCalledWith(pessoaId);
      expect(pessoasRepository.remove).toHaveBeenCalledWith(existingPessoa);
      expect(result).toEqual(existingPessoa);
    });

    it('should throw ForbiddenException when not authorized', async () => {
      const pessoaId = 1;
      const tokenPayload = { sub: 2 } as any;
      const existingPessoa = { id: pessoaId, nome: 'genzodev' };

      jest
        .spyOn(pessoasService, 'findOne')
        .mockResolvedValue(existingPessoa as any);

      await expect(
        pessoasService.remove(pessoaId, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('uploadImage', () => {
    it('should upload image for the person when authorized', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const mockPessoa = {
        id: 1,
        nome: 'genzodev',
        email: 'genzo@email.com',
      } as Pessoa;

      const tokenPayload = { sub: mockPessoa.id } as any;

      jest.spyOn(pessoasService, 'findOne').mockResolvedValue(mockPessoa);
      jest
        .spyOn(pessoasRepository, 'save')
        .mockResolvedValue({ ...mockPessoa, picture: '1.png' });

      const filePath = path.resolve(process.cwd(), 'pictures', '1.png');

      const result = await pessoasService.uploadPicture(mockFile, tokenPayload);

      expect(fs.writeFile).toHaveBeenCalledWith(filePath, mockFile.buffer);
      expect(pessoasRepository.save).toHaveBeenCalledWith({
        ...mockPessoa,
        picture: '1.png',
      });
      expect(result).toEqual({ ...mockPessoa, picture: '1.png' });
    });

    it('should throw BadRequestException when image is too small', async () => {
      const mockFile = {
        originalname: 'test.png',

        size: 500, // Menor que 1024 bytes

        buffer: Buffer.from('small content'),
      } as Express.Multer.File;

      const tokenPayload = { sub: 1 } as any;

      await expect(
        pessoasService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when person not found', async () => {
      const mockFile = {
        originalname: 'test.png',

        size: 2000,

        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const tokenPayload = { sub: 1 } as any;

      jest

        .spyOn(pessoasService, 'findOne')

        .mockRejectedValue(new NotFoundException());

      await expect(
        pessoasService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
