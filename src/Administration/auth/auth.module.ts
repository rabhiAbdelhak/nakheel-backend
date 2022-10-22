import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local-passport.strategy';
import {JwtService} from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt-strategy';
import { UserService } from '../user/user.service';


@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtService, JwtStrategy, UserService],
})
export class AuthModule {}
