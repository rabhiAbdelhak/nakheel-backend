import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './Administration/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './Administration/role/role.module';
import { UserModule } from './Administration/user/user.module';
import { JwtGuard } from './Administration/auth/guards/jwt-auth-guard';
import { ModuleModule } from './Administration/module/module.module';
import { OptionModule } from './Administration/option/option.module';
import { PermissionModule } from './Administration/permission/permission.module';
import { HttpExceptionFilter } from './httpExceptions/http-exception.filter';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { MorganInterceptor, MorganModule } from 'nest-morgan';
import { CategoryModule } from './Stock/category/category.module';
import { UnitModule } from './Stock/unit/unit.module';
import { DepotModule } from './Stock/depot/depot.module';
import { ProductsModule } from './Stock/products/products.module';
import { LotsModule } from './Stock/lots/lots.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    RoleModule,
    UserModule,
    ModuleModule,
    OptionModule,
    PermissionModule,
    MorganModule,
    CategoryModule,
    UnitModule,
    DepotModule,
    ProductsModule,
    LotsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: JwtGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MorganInterceptor('combined'),
    },
  ],
})
export class AppModule {}
