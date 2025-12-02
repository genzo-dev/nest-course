import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import appConfiguration from 'src/app/config/app.configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { RecadosModule } from 'src/recados/recados.module';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import appConfig from 'src/app/app.config';

// beforeAll(async () => {
//   process.env.JWT_SECRET = 'testsecret';
//   process.env.JWT_TOKEN_AUDIENCE = 'test-audience';
//   process.env.JWT_TOKEN_ISSUER = 'test-issuer';
//   process.env.JWT_TTL = '3600';
//   process.env.JWT_REFRESH_TTL = '86400';

//   const moduleFixture: TestingModule = await Test.createTestingModule({
//     imports: [AppModule],
//   }).compile();
// });

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AppModule], // já carrega ConfigModule e globalConfig
  }).compile();
});

const login = async (
  app: INestApplication,
  email: string,
  password: string,
) => {
  const response = await request
    .default(app.getHttpServer())
    .post('/auth')
    .send({ email, password });

  return response.body.accessToken;
};

const createUserAndLogin = async (app: INestApplication) => {
  const nome = 'any user';
  const email = 'anyuser@email.com';
  const password = '123456';

  await request.default(app.getHttpServer()).post('/pessoas').send({
    nome,
    email,
    password,
  });

  return login(app, email, password);
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(appConfig),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          database: 'testing_db',
          password: 'genzodev',
          autoLoadEntities: true, // carrega entidades sem precisar especifica-las
          synchronize: true, // sincroniza com o BD. Não deve ser usado em produção
          dropSchema: true,
        }),
        ServeStaticModule.forRoot({
          rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
          serveRoot: '/pictures',
        }),
        RecadosModule,
        PessoasModule,
      ],
    }).compile();

    app = module.createNestApplication();

    appConfiguration(app);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/pessoas (POST)', () => {
    it('should create a person with success', async () => {
      const createPessoaDto = {
        email: 'enzo@email.com',
        password: '123456',
        nome: 'Enzonovo',
        routePolicies: ['createPessoa'],
      };
      const response = await request
        .default(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        email: createPessoaDto.email,
        passwordHash: expect.any(String),
        nome: createPessoaDto.nome,
        routePolicies: createPessoaDto.routePolicies,
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: '',
        id: expect.any(Number),
      });
    });

    it('should generate error email exists', async () => {
      const createPessoaDto = {
        email: 'enzo@email.com',
        password: '123456',
        nome: 'Enzonovo',
        routePolicies: ['createPessoa'],
      };

      await request
        .default(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      const response = await request
        .default(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toBe('E-mail já está cadastrado');
    });

    it('should generate error small password', async () => {
      const createPessoaDto = {
        email: 'enzo@email.com',
        password: '123',
        nome: 'Enzonovo',
        routePolicies: ['createPessoa'],
      };

      const response = await request
        .default(app.getHttpServer())
        .post('/pessoas')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'password must be longer than or equal to 5 characters',
      ]);
    });
  });

  describe('/pessoas:id (GET)', () => {
    it('shoud be returned unauthorized for user logout', async () => {
      const pessoaResponse = await request
        .default(app.getHttpServer())
        .post('/pessoas')
        .send({
          email: 'enzo@email.com',
          password: '123456',
          nome: 'Enzonovo',
          routePolicies: ['createPessoa'],
        })
        .expect(HttpStatus.CREATED);

      const response = await request
        .default(app.getHttpServer())
        .get('/pessoas/' + pessoaResponse.body.id)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toEqual({
        message: 'Usuário não logado',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('shoud be returned a person', async () => {
      const createPessoaDto = {
        email: 'enzo@email.com',
        password: '123456',
        nome: 'Enzonovo',
        routePolicies: ['createPessoa'],
      };

      const pessoaResponse = await request
        .default(app.getHttpServer())
        .post('/pessoas')
        .send({
          email: createPessoaDto.email,
          password: createPessoaDto.password,
          nome: createPessoaDto.nome,
          routePolicies: createPessoaDto.routePolicies,
        })
        .expect(HttpStatus.CREATED);

      // const accessToken = await createUserAndLogin(app);
      const accessToken = await login(
        app,
        createPessoaDto.email,
        createPessoaDto.password,
      );

      // console.log(loginResponse.body);

      // console.log('sou idiota');
      console.log('Login response:', accessToken);

      const response = await request
        .default(app.getHttpServer())
        .get('/pessoas/' + pessoaResponse.body.id)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        email: createPessoaDto.email,
        passwordHash: expect.any(String),
        nome: createPessoaDto.nome,
        routePolicies: createPessoaDto.routePolicies,
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: '',
        id: expect.any(Number),
      });
      console.log(response.body);
    });
  });
});
