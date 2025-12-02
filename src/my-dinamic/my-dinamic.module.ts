import { DynamicModule, Module } from '@nestjs/common';

export type MyDinamicConfigs = {
  apiKey: string;
  apiUrl: string;
};

export const MY_DINAMIC_CONFIG = 'MY_DINAMIC_CONFIG';

@Module({})
export class MyDinamicModule {
  static register(configs: MyDinamicConfigs): DynamicModule {
    // Aqui eu vou usar minhas configurações

    return {
      module: MyDinamicModule,
      imports: [],
      providers: [
        {
          provide: MY_DINAMIC_CONFIG,
          useValue: configs,
        },
      ],
      controllers: [],
      exports: [MY_DINAMIC_CONFIG],
    };
  }
}
